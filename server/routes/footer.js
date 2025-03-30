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
    const savedItems = [];
    
    // 处理版权年份 - 检查是否已包含年份前缀
    if (configData.copyright && !configData.copyright.startsWith('©')) {
      configData.copyright = `© ${new Date().getFullYear()} ${configData.copyright}`;
      savedItems.push('版权信息（包含自动更新的年份）');
    } else if (configData.copyright) {
      // 如果已经包含前缀，确保年份是最新的
      configData.copyright = configData.copyright.replace(/© \d{4}/, `© ${new Date().getFullYear()}`);
      savedItems.push('版权信息（年份已更新为最新）');
    }
    
    // 固定ICP备案链接
    configData.icp_link = 'https://beian.miit.gov.cn/';
    
    // 确保社交媒体数据格式正确
    if (typeof configData.social_media === 'string') {
      try {
        const socialMedia = JSON.parse(configData.social_media);
        if (Array.isArray(socialMedia)) {
          savedItems.push(`社交媒体（${socialMedia.length}项）`);
        }
      } catch (e) {
        console.error('社交媒体数据格式错误:', e);
      }
    }
    
    // 遍历配置对象的所有属性
    for (const [key, value] of Object.entries(configData)) {
      if (key !== 'social_media' && !savedItems.includes(key)) {
        savedItems.push(key.replace(/_/g, ' '));
      }
      
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
      message: '底部配置已更新',
      savedItems
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
    // 默认配置项，版权信息自动包含当前年份
    const defaultConfigs = [
      { key: 'company_name', value: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）', description: '公司名称' },
      { key: 'company_description', value: '专注于互联网信息服务的科技公司', description: '公司描述' },
      { key: 'contact_phone', value: '+86 (10) 1234-5678', description: '联系电话' },
      { key: 'contact_email', value: 'info@aiqiji.com', description: '联系邮箱' },
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