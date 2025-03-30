import express from 'express';
import { sequelize } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// 基本健康检查
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString(),
    server: {
      uptime: Math.floor(process.uptime()) + ' 秒',
      memory: process.memoryUsage(),
      hostname: os.hostname(),
      platform: process.platform,
      nodejs: process.version
    }
  });
});

// 数据库连接检查
router.get('/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // 获取一些数据库信息
    const [dbInfo] = await sequelize.query('SELECT VERSION() as version');
    const [tables] = await sequelize.query('SHOW TABLES');
    
    res.json({
      success: true,
      message: '数据库连接正常',
      database: {
        version: dbInfo[0]?.version,
        tables: tables.map(table => Object.values(table)[0]),
        dialect: sequelize.getDialect()
      }
    });
  } catch (error) {
    console.error('数据库连接检查失败:', error);
    res.status(503).json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// Nginx配置检查
router.get('/nginx', (req, res) => {
  try {
    const nginxConfigPath = path.join(__dirname, '../../nginx.conf');
    let nginxStatus = '未找到Nginx配置文件';
    let proxyConfig = null;
    
    if (fs.existsSync(nginxConfigPath)) {
      const config = fs.readFileSync(nginxConfigPath, 'utf8');
      nginxStatus = '已找到Nginx配置';
      
      // 检查API代理设置
      const proxyMatch = config.match(/location\s+\/api\/\s+{[^}]*proxy_pass\s+http:\/\/localhost:(\d+)/s);
      if (proxyMatch) {
        proxyConfig = {
          port: proxyMatch[1],
          detected: true
        };
      }
    }
    
    res.json({
      success: true,
      nginx: {
        status: nginxStatus,
        proxy: proxyConfig,
        appPort: process.env.PORT || '8181 (默认)'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '检查Nginx配置失败',
      error: error.message
    });
  }
});

// CORS测试端点
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS测试成功',
    headers: {
      origin: req.headers.origin || '未检测到',
      referer: req.headers.referer || '未检测到'
    }
  });
});

export default router;
