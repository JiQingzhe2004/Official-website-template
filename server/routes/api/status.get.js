import nodemailer from 'nodemailer';

// 测试邮件服务器连接
async function testMailServer() {
  const transporter = nodemailer.createTransport({
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
    auth: {
      user: 'aqj@www.aiqji.com',
      pass: 'JiQingzhe520'
    }
  });
  
  try {
    await transporter.verify();
    return { status: 'ok' };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message,
      code: error.code
    };
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 测试邮件服务器
    const mailStatus = await testMailServer();
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        server: { status: 'ok' },
        mail: mailStatus
      }
    };
  } catch (error) {
    console.error('状态检测失败:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
});
