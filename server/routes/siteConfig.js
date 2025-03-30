import express from 'express';
import SiteConfig from '../models/SiteConfig.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取所有配置项(数组格式) - 确保此路由正确定义并放在/:key之前
router.get('/all', async (req, res) => {
  try {
    console.log('API: 获取所有配置项(数组格式)');
    const configs = await SiteConfig.findAll();
    
    // 根据类型处理值
    const configArray = configs.map(config => {
      let value = config.value;
      if (config.type === 'json') {
        try {
          value = JSON.parse(config.value);
        } catch (e) {
          console.error(`解析JSON配置失败: ${config.key}`, e);
        }
      }
      
      return {
        id: config.id,
        key: config.key,
        value: value,
        description: config.description,
        type: config.type || 'text', 
        path: config.path || '/',
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      };
    });
    
    res.status(200).json(configArray);
  } catch (error) {
    console.error('获取所有配置项失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取配置失败', 
      error: error.message 
    });
  }
});

// 调试路由
router.get('/debug', async (req, res) => {
  try {
    // 列出所有已注册的路由
    const routes = [];
    router.stack.forEach(r => {
      if (r.route && r.route.path) {
        const methods = Object.keys(r.route.methods)
          .filter(m => r.route.methods[m])
          .join(', ').toUpperCase();
        routes.push(`${methods} ${r.route.path}`);
      }
    });

    res.json({
      success: true,
      message: 'SiteConfig 路由调试信息',
      registeredRoutes: routes,
      modelDetails: {
        name: SiteConfig.name,
        tableName: SiteConfig.tableName
      }
    });
  } catch (error) {
    console.error('调试路由错误:', error);
    res.status(500).json({ 
      success: false,
      message: '调试路由错误', 
      error: error.message 
    });
  }
});

// 获取单个配置
router.get('/:key', async (req, res) => {
  try {
    // 过滤掉特殊路径，避免与其他路由冲突
    const key = req.params.key;
    if (key === 'all' || key === 'debug') {
      return res.status(404).json({ 
        success: false,
        message: '配置不存在' 
      });
    }
    
    const config = await SiteConfig.findOne({ where: { key } });
    if (!config) {
      return res.status(404).json({ 
        success: false,
        message: '配置不存在'
      });
    }
    
    // 根据类型处理值
    let value = config.value;
    if (config.type === 'json') {
      try {
        value = JSON.parse(config.value);
      } catch (e) {
        console.error(`解析JSON配置失败: ${config.key}`, e);
      }
    }
    
    res.status(200).json({
      success: true,
      key: config.key,
      value,
      description: config.description,
      type: config.type
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取配置失败', 
      error: error.message 
    });
  }
});

// 获取所有网站配置(对象格式) - 为了与前面的路由区分，修改响应格式
router.get('/', async (req, res) => {
  try {
    console.log('API: 获取所有网站配置(对象格式)');
    const configs = await SiteConfig.findAll();
    
    // 将配置转换为键值对格式，方便前端使用
    const configObj = {};
    configs.forEach(config => {
      // 根据类型处理值
      let value = config.value;
      if (config.type === 'json') {
        try {
          value = JSON.parse(config.value);
        } catch (e) {
          console.error(`解析JSON配置失败: ${config.key}`, e);
        }
      }
      configObj[config.key] = {
        value,
        description: config.description,
        type: config.type,
        path: config.path
      };
    });
    
    res.status(200).json(configObj);
  } catch (error) {
    console.error('获取网站配置失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取网站配置失败', 
      error: error.message 
    });
  }
});

export default router;