import express from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Carousel from '../models/Carousel.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { fileURLToPath } from 'url';

const unlink = promisify(fs.unlink);
const router = express.Router();

// @desc    获取所有轮播图
// @route   GET /api/carousel
// @access  Public
router.get('/', async (req, res) => {
  try {
    const carousels = await Carousel.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: carousels.length,
      data: carousels
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取所有轮播图(包括非活跃)
// @route   GET /api/carousel/all
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const carousels = await Carousel.findAll({
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: carousels.length,
      data: carousels
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取单个轮播图
// @route   GET /api/carousel/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const carousel = await Carousel.findByPk(req.params.id);
    if (!carousel) {
      return res.status(404).json({ success: false, message: '未找到轮播图' });
    }
    res.status(200).json({
      success: true,
      data: carousel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    创建轮播图
// @route   POST /api/carousel
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const carousel = await Carousel.create(req.body);
    res.status(201).json({
      success: true,
      data: carousel
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    更新轮播图
// @route   PUT /api/carousel/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let carousel = await Carousel.findByPk(req.params.id);
    if (!carousel) {
      return res.status(404).json({ success: false, message: '未找到轮播图' });
    }
    
    await carousel.update(req.body);
    
    res.status(200).json({
      success: true,
      data: carousel
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    删除轮播图（包括关联图片）
// @route   DELETE /api/carousel/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteImage = true, imagePath } = req.body; // 从请求体获取参数
    
    console.log(`API: 删除ID为 ${id} 的轮播图${deleteImage ? '及其图片' : ''}`);
    console.log('请求体参数:', req.body);
    
    // 先查询轮播图记录，获取图片路径
    const carousel = await Carousel.findByPk(id);
    if (!carousel) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的轮播图' 
      });
    }
    
    // 保存图片路径以便删除
    const imagePathToDelete = carousel.image || imagePath;
    console.log('准备删除的图片路径:', imagePathToDelete);
    
    // 先删除图片文件，如果设置了删除图片且图片路径存在
    let imageDeleted = false;
    if (deleteImage && imagePathToDelete) {
      try {
        // 处理路径格式
        let fullImagePath;
        if (imagePathToDelete.startsWith('/')) {
          fullImagePath = path.join(process.cwd(), 'public', imagePathToDelete);
        } else {
          fullImagePath = path.join(process.cwd(), 'public', '/', imagePathToDelete);
        }
        
        console.log('完整图片路径:', fullImagePath);
        
        // 检查文件是否存在
        if (fs.existsSync(fullImagePath)) {
          await unlink(fullImagePath);
          console.log(`已删除图片文件: ${fullImagePath}`);
          imageDeleted = true;
        } else {
          console.log(`图片文件不存在: ${fullImagePath}`);
          
          // 尝试其他可能的路径
          const alternativePath = path.join(process.cwd(), imagePathToDelete);
          if (fs.existsSync(alternativePath)) {
            await unlink(alternativePath);
            console.log(`已删除图片文件(替代路径): ${alternativePath}`);
            imageDeleted = true;
          } else {
            console.log(`替代路径也不存在: ${alternativePath}`);
          }
        }
      } catch (fileError) {
        console.error(`删除图片文件失败:`, fileError);
        console.error(`文件路径: ${imagePathToDelete}`);
        // 图片删除失败，但我们仍将继续删除数据库记录
      }
    }
    
    // 然后删除数据库记录
    await carousel.destroy();
    
    return res.json({ 
      success: true, 
      message: imageDeleted ? '轮播图及其图片已成功删除' : '轮播图已成功删除',
      data: { id, deletedImage: imageDeleted ? imagePathToDelete : null }
    });
  } catch (error) {
    console.error(`删除轮播图失败:`, error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

// @desc    上传轮播图图片
// @route   POST /api/carousel/upload
// @access  Private
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的图片' });
    }

    // 获取当前文件的目录路径
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // 构建相对路径，用于前端访问
    const relativePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      imageUrl: relativePath,
      message: '图片上传成功'
    });
  } catch (err) {
    console.error('图片上传失败:', err);
    res.status(500).json({ success: false, message: '图片上传失败' });
  }
});

// @desc    (调试) 检查图片路径
// @route   POST /api/carousel/check-path
// @access  Private
router.post('/check-path', authenticateToken, async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ success: false, message: '请提供图片路径' });
    }
    
    console.log('检查图片路径:', imagePath);
    
    // 处理路径格式
    let fullImagePath;
    if (imagePath.startsWith('/')) {
      fullImagePath = path.join(process.cwd(), 'public', imagePath);
    } else {
      fullImagePath = path.join(process.cwd(), 'public', '/', imagePath);
    }
    
    // 检查文件是否存在
    const exists = fs.existsSync(fullImagePath);
    
    // 获取目录信息
    const currentDir = process.cwd();
    const publicDir = path.join(currentDir, 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    
    // 检查目录存在
    const publicExists = fs.existsSync(publicDir);
    const uploadsExists = fs.existsSync(uploadsDir);
    
    // 如果目录存在，获取上传目录中的文件列表
    let uploadedFiles = [];
    if (uploadsExists) {
      uploadedFiles = fs.readdirSync(uploadsDir).slice(0, 10); // 限制返回前10个文件
    }
    
    return res.json({
      success: true,
      imagePath,
      fullImagePath,
      exists,
      dirInfo: {
        currentDir,
        publicDir,
        uploadsDir,
        publicExists,
        uploadsExists
      },
      uploadedFiles
    });
  } catch (error) {
    console.error('检查图片路径失败:', error);
    return res.status(500).json({
      success: false,
      message: '检查失败: ' + error.message
    });
  }
});

export default router;