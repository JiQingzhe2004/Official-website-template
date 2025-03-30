import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import FooterConfig from '../models/FooterConfig.js';

const router = express.Router();

// 获取所有底部配置
router.get('/config', async (req, res) => {
  try {
    const configs = await FooterConfig.findAll();
    
    // 将配置项转换为对象格式
    const configObject = configs.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {});
    
    res.json({
      success: true,
      data: configObject
    });
  } catch (error) {
    console.error('获取底部配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取底部配置失败',
      error: error.message
    });
  }
});

// 更新底部配置（需要管理员权限）
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const configData = req.body;
    
    // 遍历配置对象的所有属性
    for (const [key, value] of Object.entries(configData)) {
      // 查找或创建配置项
      await FooterConfig.findOrCreate({
        where: { key },
        defaults: {
          key,
          value: value || '',
          description: `底部 ${key} 配置`
        }
      });
      
      // 更新配置值
      await FooterConfig.update(
        { value: value || '' },
        { where: { key } }
      );
    }
    
    res.json({
      success: true,
      message: '底部配置已更新'
    });
  } catch (error) {
    console.error('更新底部配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新底部配置失败',
      error: error.message
    });
  }
});

// 初始化底部配置
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    // 默认配置项
    const defaultConfigs = [
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
    
    // 批量创建或更新
    for (const config of defaultConfigs) {
      await FooterConfig.findOrCreate({
        where: { key: config.key },
        defaults: config
      });
    }
    
    res.json({
      success: true,
      message: '底部配置已初始化'
    });
  } catch (error) {
    console.error('初始化底部配置失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化底部配置失败',
      error: error.message
    });
  }
});

export default router;
