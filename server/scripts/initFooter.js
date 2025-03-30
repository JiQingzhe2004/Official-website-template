import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import FooterConfig from '../models/FooterConfig.js';

// 加载环境变量
dotenv.config();

// 初始化底部配置数据
const initFooterConfig = async () => {
  try {
    console.log('开始初始化底部配置数据...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 确保模型同步到数据库
    await FooterConfig.sync({ alter: true });
    
    // 默认配置项
    const defaultConfigs = [
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
    
    // 批量创建或更新
    for (const config of defaultConfigs) {
      const [item, created] = await FooterConfig.findOrCreate({
        where: { key: config.key },
        defaults: config
      });
      
      if (created) {
        console.log(`创建配置项: ${config.key}`);
      } else {
        console.log(`配置项 ${config.key} 已存在，跳过创建`);
      }
    }
    
    console.log('底部配置数据初始化完成');
    
    // 关闭数据库连接
    await sequelize.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('初始化底部配置数据失败:', error);
  }
};

// 执行初始化
initFooterConfig();
