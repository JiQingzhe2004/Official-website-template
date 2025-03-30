import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试加载环境变量，优先从server目录查找.env文件
const envPath = path.resolve(__dirname, '.env');
const parentEnvPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.log(`从 ${envPath} 加载环境变量`);
  dotenv.config({ path: envPath });
} else if (fs.existsSync(parentEnvPath)) {
  console.log(`从 ${parentEnvPath} 加载环境变量`);
  dotenv.config({ path: parentEnvPath });
} else {
  console.warn('找不到.env文件，使用默认环境变量');
  dotenv.config();
}

// 打印关键环境变量状态（不显示具体值，避免安全问题）
console.log('环境变量加载状态：', {
  'NODE_ENV': process.env.NODE_ENV || '未设置',
  'PORT': process.env.PORT ? '已设置' : '未设置',
  'JWT_SECRET': process.env.JWT_SECRET ? '已设置' : '未设置',
  'JWT_EXPIRE': process.env.JWT_EXPIRE || '未设置'
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import installRoutes from './routes/install.js';
import carouselRoutes from './routes/carousel.js';
import ctaRoutes from './routes/cta.js';
import footerRoutes from './routes/footer.js';
import menuItemsRoutes from './routes/menuItems.js';
import pagesRoutes from './routes/pages.js';
import servicesRoutes from './routes/services.js';
import siteConfigRoutes from './routes/siteConfig.js';
import statsRoutes from './routes/stats.js';
import uploadsRoutes from './routes/uploads.js';
import whyUsRoutes from './routes/whyUs.js';
import healthRoutes from './routes/health.js';
import { outputRouteReport } from './diagnostic/route-check.js';

// 初始化Express应用
const app = express();

// CORS配置 - 修改为允许特定来源
const corsOptions = {
  origin: [
    'https://www.aiqji.cn',
    'http://www.aiqji.cn',
    'https://aiqji.cn',
    'http://aiqji.cn'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 预检请求结果缓存24小时
};

// 应用CORS配置
app.use(cors(corsOptions));

// 添加特定处理OPTIONS预检请求的中间件
app.options('*', cors(corsOptions));

// 中间件
app.use(helmet({
  // 允许跨域请求
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志记录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 设置Morgan日志
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'), 
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // 同时在控制台显示日志

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/install', installRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/cta', ctaRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/menuitems', menuItemsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/siteconfig', siteConfigRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/whyus', whyUsRoutes);
app.use('/api/health', healthRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString()
  });
});

// JWT配置检查端点 (仅在开发环境显示)
app.get('/api/config-check', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: '该端点在生产环境中不可用' });
  }
  
  res.json({
    jwtConfigured: !!process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '默认',
    envLoaded: true,
    dirname: __dirname
  });
});

// CORS测试端点
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS已正确配置',
    origin: req.headers.origin || '未知来源',
    time: new Date().toISOString()
  });
});

// 路由调试端点
app.get('/api/debug-endpoints', (req, res) => {
  const routes = app._router.stack
    .filter(r => r.route)
    .map(r => {
      return {
        path: r.route.path,
        methods: Object.keys(r.route.methods).filter(m => r.route.methods[m])
      };
    });
    
  res.json({
    success: true,
    message: '可用API端点',
    routes,
    apiPrefix: '/api'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `找不到路由: ${req.method} ${req.path}`,
    availableEndpoints: '/api/debug-endpoints'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 定义端口
const PORT = process.env.PORT || 8181;

// 根据环境确定同步选项
let syncOptions = {};
if (process.env.NODE_ENV === 'development') {
  syncOptions = { alter: true }; // 开发环境更新表结构
} else if (process.env.NODE_ENV === 'test') {
  syncOptions = { force: true }; // 测试环境重建表
} else {
  syncOptions = {}; // 生产环境仅创建不存在的表
}

// 连接数据库并启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 添加模型同步 - 根据模型定义同步数据库结构
    console.log(`正在同步数据库模型... (模式: ${Object.keys(syncOptions).length ? JSON.stringify(syncOptions) : '安全模式'})`);
    await sequelize.sync(syncOptions);
    console.log('数据库模型同步完成');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`==============================`);
      console.log(`服务器已启动，运行在端口 ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==============================`);
      
      // 输出路由诊断报告
      outputRouteReport(app);
    });
  } catch (error) {
    console.error('无法连接到数据库或同步模型:', error);
    console.log('请检查数据库配置和连接');
    process.exit(1); // 退出进程
  }
};

startServer();