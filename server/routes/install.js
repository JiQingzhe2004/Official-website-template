import express from 'express';
import { Sequelize } from 'sequelize';
import { sequelize, testConnection } from '../config/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import SiteConfig from '../models/SiteConfig.js';
import MenuItem from '../models/MenuItem.js';
import Page from '../models/Page.js';
import Carousel from '../models/Carousel.js';
import Service from '../models/Service.js';
import Stat from '../models/Stat.js';
import WhyUs from '../models/WhyUs.js';
import CTA from '../models/CTA.js';
import FooterConfig from '../models/FooterConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// 创建日志目录和日志文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');
const installLogPath = path.join(logDir, 'install.log');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志记录函数
const logInstall = (message, isError = false) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 追加到日志文件
  fs.appendFile(installLogPath, logMessage, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
  
  // 同时输出到控制台
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
};

// @desc    检查安装状态
// @route   GET /api/install/check
// @access  Public
router.get('/check', async (req, res) => {
  try {
    // 检查数据库配置是否存在
    const dbConfigPath = path.resolve(process.cwd(), './config/dbConfig.js');
    const hasDbConfig = fs.existsSync(dbConfigPath);
    
    // 检查是否有管理员用户
    const adminCount = await User.count();
    
    res.status(200).json({
      installed: hasDbConfig && adminCount > 0,
      hasDbConfig,
      hasAdmin: adminCount > 0
    });
  } catch (err) {
    console.error('检查安装状态失败:', err);
    res.status(500).json({
      success: false,
      message: '检查安装状态失败',
      error: err.message
    });
  }
});

// @desc    测试数据库连接
// @route   POST /api/install/test-connection
// @access  Public
router.post('/test-connection', async (req, res) => {
  try {
    logInstall(`收到测试连接请求: ${JSON.stringify(req.body)}`);
    logInstall(`请求头部: Origin=${req.headers.origin}, Content-Type=${req.headers['content-type']}`);

    // 测试数据库连接
    await sequelize.authenticate();
    
    logInstall('数据库连接测试成功');
    
    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '数据库连接成功',
      database: {
        name: sequelize.config.database,
        dialect: sequelize.options.dialect
      }
    });
  } catch (error) {
    logInstall(`测试连接失败: ${error.message}`, true);
    
    return res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// @desc    初始化数据库
// @route   POST /api/install/init-database
// @access  Public
router.post('/init-database', async (req, res) => {
  try {
    const { host, port, database, username, password } = req.body;
    
    if (!username || !password) {
      throw new Error('数据库用户名和密码不能为空');
    }
    
    // 创建临时Sequelize实例
    const tempSequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'mysql',
      logging: false
    });
    
    await tempSequelize.authenticate();
    
    // 测试连接
    await tempSequelize.authenticate();
    
    // 将配置写入dbConfig.js文件
    try {
      const fs = await import('fs');
      const path = await import('path');
      const configDir = path.resolve(process.cwd(), './config');
      
      // 确保config目录存在
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const configPath = path.join(configDir, 'dbConfig.js');
      
      // 生成新的配置内容
      const configContent = `export default {
  host: '${host}',
  port: '${port}',
  database: '${database}',
  username: '${username}',
  password: '${password}'
};`;
      
      // 写入配置文件
      fs.writeFileSync(configPath, configContent, 'utf8');
      console.log('数据库配置已写入dbConfig.js文件');
    } catch (fsError) {
      console.error('写入dbConfig.js文件失败:', fsError);
      throw new Error('无法保存数据库配置');
    }
    
    if (!res.headersSent) {
      res.status(200).json({
        success: true,
        message: '数据库初始化成功'
      });
    }
  } catch (err) {
    console.error('数据库初始化失败:', err);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: `数据库初始化失败: ${err.message}`
      });
    }
  }
});

// @desc    创建表结构
// @route   POST /api/install/init-tables
// @access  Public
router.post('/init-tables', async (req, res) => {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ force: true });
    
    res.status(200).json({
      success: true,
      message: '表结构创建成功'
    });
  } catch (err) {
    console.error('表结构创建失败:', err);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: `表结构创建失败: ${err.message}`
      });
    }
  }
});

// @desc    初始化示例数据
// @route   POST /api/install/init-data
// @access  Public
router.post('/init-data', async (req, res) => {
  try {
    // 创建默认网站配置
    await SiteConfig.bulkCreate([
      { key: 'site_name', value: '爱奇吉', description: '网站名称', type: 'text', path: '/' },
      { key: 'site_description', value: '爱奇吉官方网站', description: '网站描述', type: 'text', path: '/' },
      { key: 'site_logo', value: '/logo.png', description: '网站Logo路径', type: 'text', path: '/' },
      { key: 'site_favicon', value: '/favicon.ico', description: '网站图标路径', type: 'text', path: '/' },
      { key: 'site_theme', value: 'light', description: '网站主题', type: 'text', path: '/' },
      { key: 'home_page', value: 'home', description: '首页slug', type: 'text', path: '/' }
    ]);

    // 创建默认页面
    await Page.bulkCreate([
      {
        title: '首页',
        slug: 'home',
        content: '<h1>欢迎来到爱奇吉</h1>',
        meta_title: '爱奇吉 - 首页',
        meta_description: '爱奇吉官方网站首页',
        status: 'published',
        template: 'home',
        order: 0,
        is_system: true
      },
      {
        title: '关于我们',
        slug: 'about',
        content: '<h1>关于爱奇吉</h1>',
        meta_title: '关于爱奇吉',
        meta_description: '关于爱奇吉的详细信息',
        status: 'published',
        template: 'default',
        order: 1,
        is_system: false
      }
    ]);

    // 创建默认菜单项
    await MenuItem.bulkCreate([
      { title: '首页', url: '/', order: 0, target: '_self', path: '/' },
      { title: '关于我们', url: '/about', order: 1, target: '_self', path: '/about' },
      { title: '服务项目', url: '/services', order: 2, target: '_self', path: '/services' },
      { title: '成功案例', url: '/cases', order: 3, target: '_self', path: '/cases' },
      { title: '联系我们', url: '/contact', order: 4, target: '_self', path: '/contact' }
    ]);
    
    // 创建轮播图示例数据
    await Carousel.bulkCreate([
      {
        title: '欢迎来到爱奇吉',
        description: '我们提供专业的AI解决方案，助力企业数字化转型',
        buttonText: '了解更多',
        imageUrl: '/1.jpg',
        order: 0,
        isActive: true
      },
      {
        title: '智能化服务',
        description: '定制化AI应用开发，满足您的业务需求',
        buttonText: '联系我们',
        imageUrl: '/2.jpg',
        order: 1,
        isActive: true
      },
      {
        title: '数据分析与挖掘',
        description: '利用AI技术，从海量数据中发现价值',
        buttonText: '服务详情',
        imageUrl: '/3.jpg',
        order: 2,
        isActive: true
      }
    ]);
    
    // 创建服务示例数据
    await Service.bulkCreate([
      {
        title: '网站开发',
        icon: 'GlobalOutlined',  // 明确指定图标代码
        description: '提供响应式网站设计与开发，确保在各种设备上都有出色的用户体验',
        order: 0,
        isActive: true
      },
      {
        title: '应用程序开发',
        icon: 'AppstoreOutlined',  // 明确指定图标代码
        description: '开发高性能的移动应用和桌面应用，满足您的业务需求',
        order: 1,
        isActive: true
      },
      {
        title: '技术咨询',
        icon: 'ToolOutlined',  // 明确指定图标代码
        description: '提供专业的技术咨询服务，帮助您制定最佳的技术战略和解决方案',
        order: 2,
        isActive: true
      },
      {
        title: 'AI培训课程',
        icon: 'RocketOutlined',  // 明确指定图标代码
        description: '提供AI相关技术培训，帮助企业培养AI人才',
        order: 3,
        isActive: true
      }
    ]);
    
    // 创建统计数据示例数据
    await Stat.bulkCreate([
      {
        number: '100+',
        title: '成功案例',
        order: 0,
        isActive: true
      },
      {
        number: '50+',
        title: '合作伙伴',
        order: 1,
        isActive: true
      },
      {
        number: '5年+',
        title: '行业经验',
        order: 2,
        isActive: true
      },
      {
        number: '1000+',
        title: '服务客户',
        order: 3,
        isActive: true
      }
    ]);
    
    // 创建CTA示例数据
    await CTA.bulkCreate([
      {
        title: '准备好开始您的AI之旅了吗？',
        description: '联系我们，获取专业的AI解决方案',
        buttonText: '立即咨询',
        isActive: true
      }
    ]);
    
    // 创建WhyUs示例数据
    await WhyUs.bulkCreate([
      {
        title: '专业团队',
        icon: 'users',
        description: '我们拥有一支经验丰富的AI专业团队，能够为您提供最优质的服务',
        order: 0,
        isActive: true
      },
      {
        title: '定制化解决方案',
        icon: 'cogs',
        description: '根据您的业务需求，提供量身定制的AI解决方案',
        order: 1,
        isActive: true
      },
      {
        title: '持续技术支持',
        icon: 'headset',
        description: '我们提供7*24小时技术支持，确保您的系统稳定运行',
        order: 2,
        isActive: true
      },
      {
        title: '优质售后服务',
        icon: 'handshake',
        description: '完善的售后服务体系，让您无后顾之忧',
        order: 3,
        isActive: true
      }
    ]);

    // 创建底部配置
    const footerConfigs = [
      { key: 'company_name', value: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）', description: '公司名称' },
      { key: 'company_description', value: '专注于互联网信息服务的科技公司', description: '公司描述' },
      { key: 'contact_phone', value: '+86 (10) 1234-5678', description: '联系电话' },
      { key: 'contact_email', value: 'info@aiqiji.com', description: '联系邮箱' },
      { key: 'weixin', value: 'aiqiji_weixin', description: '微信账号' },
      { key: 'weibo', value: 'aiqiji_weibo', description: '微博账号' },
      { key: 'zhihu', value: 'aiqiji', description: '知乎账号' },
      { key: 'copyright', value: `© ${new Date().getFullYear()} 郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有`, description: '版权信息' },
      { key: 'icp', value: '豫ICP备2023020388号-2', description: 'ICP备案号' },
      { key: 'icp_link', value: 'https://beian.miit.gov.cn/', description: 'ICP备案链接' },
    ];
    
    // 批量创建底部配置
    await FooterConfig.bulkCreate(footerConfigs);

    res.status(200).json({
      success: true,
      message: '示例数据初始化成功'
    });
  } catch (err) {
    console.error('示例数据初始化失败:', err);
    if (!res.headersSent) {
      res.status(400).json({
        success: false,
        message: `示例数据初始化失败: ${err.message}`
      });
    }
  }
});

// @desc    初始化安装流程
// @route   POST /api/install/init
// @access  Public
router.post('/init', async (req, res) => {
  try {
    const { host, port, database, username, password, adminUsername, adminPassword } = req.body;
    
    // 1. 测试数据库连接
    await testConnection();
    
    // 2. 初始化数据库表结构
    await sequelize.sync({ force: true });
    
    // 3. 创建管理员账户
    if (adminUsername && adminPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await User.create({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });
    }
    
    res.status(201).json({
      success: true,
      message: '系统初始化成功'
    });
  } catch (err) {
    console.error('系统初始化失败:', err);
    res.status(400).json({
      success: false,
      message: `系统初始化失败: ${err.message}`
    });
  }
});

// @desc    创建管理员账户
// @route   POST /api/install/create-admin
// @access  Public
router.post('/create-admin', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // 验证输入参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    
    // 创建管理员用户（让模型的hooks处理密码加密）
    const user = await User.create({
      username,
      password,
      role: role || 'admin'
    });
    
    res.status(201).json({
      success: true,
      message: '管理员账户创建成功'
    });
  } catch (err) {
    console.error('管理员账户创建失败:', err);
    res.status(400).json({
      success: false,
      message: `管理员账户创建失败: ${err.message}`
    });
  }
});

// @desc    系统健康检查
// @route   GET /api/install/health
// @access  Public
router.get('/health', (req, res) => {
  logInstall(`收到健康检查请求: IP=${req.ip}`);
  
  res.status(200).json({
    success: true,
    message: '系统正常运行',
    timestamp: new Date().toISOString()
  });
});

export default router;