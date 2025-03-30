import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import SiteConfig from '../models/SiteConfig.js';

// 加载环境变量
dotenv.config();

// 初始化基础配置
const initBasicConfigs = async () => {
  try {
    console.log('开始初始化基础网站配置...');
    
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');
    
    // 基础网站配置
    const basicConfigs = [
      { key: 'home_page', value: 'home', description: '首页slug', type: 'text', path: '/' },
      { key: 'site_description', value: '爱奇吉官方网站', description: '网站描述', type: 'text', path: '/' },
      { key: 'site_favicon', value: '/favicon.ico', description: '网站图标路径', type: 'text', path: '/' },
      { key: 'site_logo', value: '/logo.png', description: '网站Logo路径', type: 'image', path: '/' },
      { key: 'site_name', value: '爱奇吉', description: '网站名称', type: 'text', path: '/' },
      { key: 'site_theme', value: 'light', description: '网站主题', type: 'text', path: '/' }
    ];
    
    for (const config of basicConfigs) {
      const [siteConfig, created] = await SiteConfig.findOrCreate({
        where: { key: config.key },
        defaults: config
      });
      
      if (created) {
        console.log(`创建基础配置成功: ${config.key}`);
      } else {
        console.log(`基础配置已存在: ${config.key}`);
      }
    }
    
    console.log('基础网站配置初始化完成');
  } catch (error) {
    console.error('基础网站配置初始化失败:', error);
  }
};

// 执行初始化
initBasicConfigs();
