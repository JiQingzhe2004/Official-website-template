import nodemailer from 'nodemailer';

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: 'smtpdm.aliyun.com',
  port: 465,
  secure: true, // 使用SSL
  auth: {
    user: 'aqj@www.aiqji.com',
    pass: 'JiQingzhe520'
  }
});

// 处理邮件发送请求
export const sendContactEmail = async (req, res) => {
  // 仅支持POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持POST请求' });
  }

  try {
    console.log('收到表单提交请求:', req.body);
    const { name, email, phone, subject, message, timestamp, source } = req.body;

    // 验证必要字段
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 构建邮件内容
    const mailOptions = {
      from: {
        name: '爱奇吉',
        address: 'aqj@www.aiqji.com'
      },
      to: ['304028273@qq.com'], // 可以设置多个收件人
      subject: `官网留言: ${subject}`,
      html: `
        <h2>官网留言表单提交</h2>
        <p><strong>姓名:</strong> ${name}</p>
        <p><strong>邮箱:</strong> ${email}</p>
        <p><strong>电话:</strong> ${phone || '未提供'}</p>
        <p><strong>主题:</strong> ${subject}</p>
        <p><strong>留言内容:</strong></p>
        <div style="padding: 10px; background-color: #f8f8f8; border-left: 4px solid #1890ff;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <p><strong>提交时间:</strong> ${new Date(timestamp).toLocaleString('zh-CN')}</p>
        <p><strong>来源:</strong> ${source}</p>
        <hr>
        <p style="color: #888; font-size: 12px;">此邮件由系统自动发送，请勿直接回复此邮件。</p>
      `
    };

    // 发送邮件
    console.log('准备发送邮件到管理员...');
    const info = await transporter.sendMail(mailOptions);
    console.log('管理员邮件发送成功:', info.messageId);

    // 自动回复给提交者的确认邮件
    const autoReplyOptions = {
      from: {
        name: '爱奇吉',
        address: 'aqj@www.aiqji.com'
      },
      to: email,
      subject: '感谢您的留言【爱奇吉】',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #1890ff;">感谢您的留言</h2>
          <p>尊敬的 ${name}：</p>
          <p>感谢您通过我们的官网联系表单与我们取得联系。我们已收到您的留言，内容如下：</p>
          <div style="padding: 15px; background-color: #f8f8f8; border-left: 4px solid #1890ff; margin: 15px 0;">
            <p><strong>主题:</strong> ${subject}</p>
            <p><strong>留言内容:</strong> ${message.replace(/\n/g, '<br/>')}</p>
          </div>
          <p>我们的团队将尽快审阅您的留言，并在24小时内与您联系。</p>
          <p>如有紧急事项，您也可以通过电话 +86 15670141215 与我们联系。</p>
          <p>再次感谢您的关注与支持！</p>
          <div style="margin-top: 30px;">
            <p>此致，</p>
            <p><strong>爱奇吉团队</strong></p>
          </div>
          <hr style="border: none; height: 1px; background-color: #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">此邮件由系统自动发送，请勿直接回复此邮件。</p>
        </div>
      `
    };

    // 发送自动回复邮件
    console.log('准备发送自动回复邮件...');
    const replyInfo = await transporter.sendMail(autoReplyOptions);
    console.log('自动回复邮件发送成功:', replyInfo.messageId);

    // 返回成功响应
    res.status(200).json({ message: '邮件发送成功', success: true });
  } catch (error) {
    console.error('邮件发送失败:', error);
    // 确保返回一个有效的JSON响应
    res.status(500).json({ 
      message: '邮件发送失败', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

export default { sendContactEmail };
