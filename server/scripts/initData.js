import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import SiteConfig from '../models/SiteConfig.js';
import MenuItem from '../models/MenuItem.js';
import Page from '../models/Page.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import FooterConfig from '../models/FooterConfig.js';

// 加载环境变量
dotenv.config();

// 初始化数据
const initData = async () => {
  try {
    console.log('开始初始化数据...');
    
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');
    
    // 创建默认管理员用户
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('创建默认管理员用户成功');
    }
    
    // 创建基本网站配置
    const siteConfigs = [
      { key: 'site_title', value: '爱奇吉', description: '网站标题', type: 'text', path: '/' },
      { key: 'site_logo', value: '/logo.png', description: '网站Logo', type: 'image', path: '/' },
      { key: 'site_description', value: '专注于互联网信息服务的科技公司', description: '网站描述', type: 'text', path: '/' },
      // 添加其他必需配置
      { key: 'home_page', value: 'home', description: '首页slug', type: 'text', path: '/' },
      { key: 'site_favicon', value: '/favicon.ico', description: '网站图标路径', type: 'text', path: '/' },
      { key: 'site_name', value: '爱奇吉', description: '网站名称', type: 'text', path: '/' },
      { key: 'site_theme', value: 'light', description: '网站主题', type: 'text', path: '/' }
    ];
    
    for (const config of siteConfigs) {
      const [siteConfig, created] = await SiteConfig.findOrCreate({
        where: { key: config.key },
        defaults: config
      });
      
      if (created) {
        console.log(`创建配置成功: ${config.key}`);
      }
    }
    
    // 创建底部配置数据
    const footerConfigs = [
      { key: 'company_name', value: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）', description: '公司名称' },
      { key: 'company_description', value: '专注于互联网信息服务的科技公司', description: '公司描述' },
      { key: 'contact_phone', value: '+86 (10) 1234-5678', description: '联系电话' },
      { key: 'contact_email', value: 'info@aiqiji.com', description: '联系邮箱' },
      // 使用新的社交媒体格式，包含图标信息
      { key: 'social_media', value: JSON.stringify([
        { id: 1, name: '微信', icon: 'wechat', link: 'aiqiji_weixin' },
        { id: 2, name: '微博', icon: 'weibo', link: 'aiqiji_weibo' },
        { id: 3, name: '知乎', icon: 'zhihu', link: 'aiqiji' }
      ]), description: '社交媒体链接' },
      { key: 'copyright', value: `© ${new Date().getFullYear()} 郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有`, description: '版权信息' },
      { key: 'icp', value: '豫ICP备2023020388号-2', description: 'ICP备案号' },
      { key: 'icp_link', value: 'https://beian.miit.gov.cn/', description: 'ICP备案链接' },
    ];
    
    for (const config of footerConfigs) {
      const [footerConfig, created] = await FooterConfig.findOrCreate({
        where: { key: config.key },
        defaults: config
      });
      
      if (created) {
        console.log(`创建底部配置成功: ${config.key}`);
      }
    }
    
    // 创建默认菜单项
    const menuItems = [
      { title: '首页', path: '/', position: 'top', order: 1 },
      { title: '服务', path: '/services', position: 'top', order: 2 },
      { title: '关于我们', path: '/about', position: 'top', order: 3 },
      { title: '案例展示', path: '/cases', position: 'top', order: 4 },
      { title: '联系我们', path: '/contact', position: 'top', order: 5 },
      { title: '关于我们', path: '/about', position: 'bottom', order: 1 },
      { title: '服务', path: '/services', position: 'bottom', order: 2 },
      { title: '联系我们', path: '/contact', position: 'bottom', order: 3 },
      { title: '隐私政策', path: '/privacy', position: 'bottom', order: 4 }
    ];
    
    for (const item of menuItems) {
      const [menuItem, created] = await MenuItem.findOrCreate({
        where: { title: item.title, position: item.position },
        defaults: item
      });
      
      if (created) {
        console.log(`创建菜单项成功: ${item.title} (${item.position})`);
      }
    }
    
    // 创建系统页面
    const pages = [
      { 
        title: '隐私政策', 
        slug: 'privacy', 
        content: '<h1>隐私政策</h1><p>这是爱奇吉的隐私政策页面内容。</p>', 
        status: 'published',
        is_system: true
      }
    ];
    
    for (const page of pages) {
      const [pageItem, created] = await Page.findOrCreate({
        where: { slug: page.slug },
        defaults: page
      });
      
      if (created) {
        console.log(`创建页面成功: ${page.title}`);
      }
    }
    
    console.log('数据初始化完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
  }
};

// 执行初始化
initData();