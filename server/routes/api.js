import express from 'express';
import { sendContactEmail } from '../api/sendMail.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 联系表单邮件发送路由
router.post('/sendMail', sendContactEmail);

// 尝试导入路由文件的函数
const tryImportRoute = async (routeName) => {
  try {
    // 检查文件是否存在
    const routePath = path.join(__dirname, `${routeName}.js`);
    if (fs.existsSync(routePath)) {
      const module = await import(`./${routeName}.js`);
      return module.default;
    }
    console.warn(`警告: 路由文件 ${routeName}.js 不存在，已跳过`);
    return null;
  } catch (error) {
    console.error(`导入路由 ${routeName} 时出错:`, error.message);
    return null;
  }
};

// 初始化路由的异步函数
const initializeRoutes = async () => {
  // 要加载的路由列表
  const routeModules = [
    { name: 'auth', path: '/auth' },
    { name: 'users', path: '/users' },
    { name: 'install', path: '/install' },
    { name: 'carousel', path: '/carousel' },
    { name: 'cta', path: '/cta' },
    { name: 'footer', path: '/footer' },
    { name: 'menuItems', path: '/menuitems' },
    { name: 'pages', path: '/pages' },
    { name: 'services', path: '/services' },
    { name: 'siteConfig', path: '/siteconfig' },
    { name: 'stats', path: '/stats' },
    { name: 'uploads', path: '/uploads' },
    { name: 'whyUs', path: '/whyus' },
    { name: 'health', path: '/health' }
  ];

  // 加载存在的路由模块
  for (const route of routeModules) {
    const routeModule = await tryImportRoute(route.name);
    if (routeModule) {
      router.use(route.path, routeModule);
      console.log(`已加载路由模块: ${route.name} -> ${route.path}`);
    }
  }
};

// 立即执行初始化
initializeRoutes().catch(err => {
  console.error('路由初始化失败:', err);
});

// 健康检查端点
router.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'undefined',
    timestamp: new Date().toISOString()
  });
});

// API信息端点
router.get('/info', (req, res) => {
  res.json({
    name: 'AIQIJI API',
    version: '1.0.0',
    description: '爱奇迹网站后端API',
    endpoints: '使用 /api/debug-endpoints 查看所有可用端点'
  });
});

// 调试端点 - 显示所有注册的路由
router.get('/debug-endpoints', (req, res) => {
  const routes = [];
  
  // 获取路由器中的所有路由
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      // 对于直接路由
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter(method => middleware.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({ path: `/api${path}`, methods });
    } else if (middleware.name === 'router') {
      // 对于子路由器
      const path = middleware.regexp.toString()
        .replace('\\/?(?=\\/|$)', '')
        .replace(/^\/\^\\\//, '')
        .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '');
        
      routes.push({ 
        path: `/api/${path}`, 
        type: 'router',
        info: '子路由模块' 
      });
    }
  });
  
  res.json({
    success: true,
    message: '可用API端点',
    routes,
    apiPrefix: '/api'
  });
});

export default router;
