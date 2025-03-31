import { sendContactEmail } from '../../api/sendMail';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // 调用发送邮件函数
    const result = await sendContactEmail({ method: 'POST', body }, event);
    
    // 检查结果是否有效
    if (!result || typeof result !== 'object') {
      console.error('邮件处理函数返回了无效结果');
      throw new Error('邮件处理函数返回了无效的结果');
    }
    
    // 正确响应格式：直接返回JSON对象
    if (result.statusCode === 200) {
      return { 
        success: true, 
        message: result.body && result.body.message ? result.body.message : '邮件发送成功' 
      };
    } else {
      // 错误响应
      const statusCode = result.statusCode || 500;
      setResponseStatus(event, statusCode);
      
      const errorBody = typeof result.body === 'string' 
        ? { message: result.body } 
        : (result.body || { message: '处理请求失败' });
        
      return {
        success: false,
        message: errorBody.message || '处理请求失败',
        error: errorBody.error || null,
        details: result // 开发环境下返回更多细节
      };
    }
  } catch (error) {
    console.error('请求处理失败:', error.message);
    
    // 设置错误状态码
    setResponseStatus(event, 500);
    
    // 返回一个简单明了的错误响应
    return {
      success: false,
      message: '服务器内部错误',
      error: error.message || '未知错误',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
});
