import SiteConfig from '../../models/SiteConfig.js';

export default defineEventHandler(async (event) => {
  try {
    // 尝试从数据库获取版权信息
    const copyright = await SiteConfig.findOne({ 
      where: { key: 'copyright' } 
    });
    
    if (copyright) {
      return {
        success: true,
        value: copyright.value,
        lastUpdated: copyright.updatedAt
      };
    }
    
    // 如果没有找到版权信息，返回默认值
    const currentYear = new Date().getFullYear();
    return {
      success: true,
      value: `© ${currentYear} 爱奇吉. 保留所有权利.`,
      isDefault: true
    };
  } catch (error) {
    console.error('获取版权信息失败:', error);
    return {
      success: false,
      message: '获取版权信息失败',
      error: error.message,
      defaultValue: `© ${new Date().getFullYear()} 爱奇吉. 保留所有权利.`
    };
  }
});
