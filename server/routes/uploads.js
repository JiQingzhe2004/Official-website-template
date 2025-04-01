import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

// 前端项目的根目录路径 - 根据实际项目结构调整
const frontendRoot = path.resolve('..'); // 假设后端项目和前端项目是同级目录

// 配置multer以处理文件上传 - 将文件直接保存到前端项目的public目录
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // 上传到前端项目的public/uploads目录
    const uploadDir = path.join(frontendRoot, 'public', 'uploads');
    console.log('上传目录:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // 生成唯一文件名，保留原始文件扩展名
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// 文件过滤器，只允许图片文件
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 创建上传中间件
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 提高到5MB
  }
});

// 调试路由，显示请求信息
router.all('*', (req, res, next) => {
  console.log(`[上传路由] ${req.method} ${req.path}`);
  console.log('请求头:', req.headers);
  if(req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', req.body);
  }
  next();
});

// 上传测试端点 - 确保路径能被正确访问
router.get('/test', (req, res) => {
  try {
    console.log('处理上传测试请求');
    // 检查前端上传目录是否存在
    const uploadDir = path.join(frontendRoot, 'public', 'uploads');
    let dirExists = fs.existsSync(uploadDir);
    
    if (!dirExists) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        dirExists = true;
        console.log('前端上传目录创建成功:', uploadDir);
      } catch (mkdirError) {
        console.error('创建前端上传目录失败:', mkdirError);
      }
    }
    
    // 检查目录是否可写
    let isWritable = false;
    try {
      const testFile = path.join(uploadDir, '.test-write-permission');
      fs.writeFileSync(testFile, 'test', { flag: 'w' });
      fs.unlinkSync(testFile);
      isWritable = true;
      console.log('上传目录权限测试通过');
    } catch (writeError) {
      console.error('上传目录无写入权限:', writeError);
    }
    
    // 列出现有上传文件
    let uploadedFiles = [];
    if (dirExists) {
      try {
        uploadedFiles = fs.readdirSync(uploadDir).filter(file => 
          !file.startsWith('.')
        ).slice(0, 20); // 限制返回数量
      } catch (readError) {
        console.error('读取上传文件列表失败:', readError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: '上传服务状态检查',
      path: req.path,
      method: req.method,
      uploadsDir: uploadDir,
      frontendRoot: frontendRoot,
      dirExists: dirExists,
      isWritable: isWritable,
      publicDirExists: fs.existsSync(path.join(frontendRoot, 'public')),
      uploadedFiles: uploadedFiles
    });
  } catch (error) {
    console.error('测试上传API失败:', error);
    res.status(500).json({
      success: false,
      message: `测试失败: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 根路径上传端点 - 匹配 /api/uploads
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('接收到图片上传请求 (根路径)');
    console.log('请求头:', req.headers);
    console.log('请求体:', req.body);
    console.log('上传的文件:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未提供有效的图片文件'
      });
    }

    // 获取上传文件的相对路径 - 直接使用前端可访问的路径
    const filePath = `/uploads/${req.file.filename}`;
    
    // 如果请求中包含键名，自动更新对应的配置
    if (req.body.key) {
      console.log(`更新配置: ${req.body.key} => ${filePath}`);
      await SiteConfig.upsert({
        key: req.body.key,
        value: filePath,
        description: req.body.description || '上传的图片',
        type: 'image',
        path: req.body.path || '/'
      });
    }

    res.status(201).json({
      success: true,
      message: '图片上传成功',
      filePath,
      imageUrl: filePath,
      fullPath: `/uploads/${req.file.filename}` // 返回前端可直接访问的路径
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: `图片上传失败: ${error.message}`
    });
  }
});

// config路径 - 匹配 /api/uploads/config
router.post('/config', upload.single('file'), async (req, res) => {
  // 直接调用根路径上传处理函数处理请求
  console.log('接收到/config路径上传请求，转发到根路径处理');
  return router.handle(req, res);
});

export default router;
