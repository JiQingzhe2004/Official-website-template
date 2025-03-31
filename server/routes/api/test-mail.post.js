import { sendContactEmail } from '../../api/sendMail';

export default defineEventHandler(async (event) => {
  try {
    // 返回简单的成功响应，确认API路由可访问
    return {
      success: true,
      message: 'API端点工作正常',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('测试端点错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
