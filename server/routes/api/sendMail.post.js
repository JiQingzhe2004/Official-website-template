import { sendContactEmail } from '../../api/sendMail';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // 转发到处理函数
    return sendContactEmail({ method: 'POST', body }, event);
  } catch (error) {
    console.error('处理sendMail请求时出错:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '服务器内部错误',
        error: error.message
      })
    };
  }
});
