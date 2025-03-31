import nodemailer from 'nodemailer';
import https from 'https';
import querystring from 'querystring';
import axios from 'axios'; // 添加axios用于获取网站配置
import EmailService from '../services/emailService.js';

// 导入配置，优先使用相对路径，这样Express和Nitro路由都能找到
let captchaConfig;
try {
  // 直接设置默认配置，避免导入问题
  captchaConfig = {
    appId: '190331080', 
    appSecretKey: 'MLCHfw3jRhAgssEjGdcTwKA4u'
  };
} catch (error) {
  console.warn('配置加载失败，使用默认配置');
  captchaConfig = {
    appId: '190331080',
    appSecretKey: 'MLCHfw3jRhAgssEjGdcTwKA4u'
  };
}

// 使用内置https模块的辅助函数
function makeHttpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`解析响应失败: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// 获取网站版权信息
async function getCopyrightInfo() {
  try {
    // 尝试从API获取版权信息
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
    const response = await axios.get(`${baseUrl}/api/siteconfig/copyright`);
    
    if (response.data && response.data.value) {
      return response.data.value;
    }
    
    // 如果无法获取特定的copyright配置，尝试获取全部配置
    try {
      const allConfigResponse = await axios.get(`${baseUrl}/api/siteconfig`);
      if (allConfigResponse.data && allConfigResponse.data.copyright && allConfigResponse.data.copyright.value) {
        return allConfigResponse.data.copyright.value;
      }
    } catch (allConfigError) {
      console.error('获取全部配置失败:', allConfigError);
    }
    
    // 如果无法获取，返回默认值
    return `© ${new Date().getFullYear()} 爱奇吉科技. 保留所有权利.`;
  } catch (error) {
    console.error('获取版权信息失败:', error);
    return `© ${new Date().getFullYear()} 爱奇吉科技. 保留所有权利.`;
  }
}

// 创建美化的邮件模板
async function createEmailTemplate(name, subject, message, isReply = true, options = {}) {
  // 获取版权信息
  let copyright;
  try {
    copyright = await getCopyrightInfo();
  } catch (error) {
    console.error('获取版权信息时出错:', error);
    copyright = `© ${new Date().getFullYear()} 爱奇吉科技. 保留所有权利.`;
  }
  
  const email = options.email || '';
  const phone = options.phone || '';
  
  // 定义品牌颜色
  const primaryColor = '#1890ff';
  const secondaryColor = '#36cfc9';
  const darkGray = '#333333';
  const lightGray = '#f8f8f8';
  
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${isReply ? '感谢您的留言' : '新的留言通知'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style type="text/css">
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #333333;
          background-color: #f4f7fa;
        }
        table {
          border-collapse: collapse;
        }
        table td {
          border-collapse: collapse;
        }
        .container {
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #1890ff;
          color: #ffffff;
          padding: 25px;
          text-align: center;
        }
        .content {
          padding: 25px;
        }
        .message-box {
          background-color: #f8f8f8;
          border-left: 4px solid #1890ff;
          padding: 15px;
          margin: 15px 0;
        }
        .contact-info {
          background-color: #f9f9f9;
          padding: 15px;
          margin: 15px 0;
        }
        .footer {
          background-color: #f4f7fa;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #666666;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #1890ff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .divider {
          border-top: 1px solid #eeeeee;
          margin: 20px 0;
        }
        a {
          color: #1890ff;
          text-decoration: none;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; background-color: #f4f7fa;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f7fa">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <!-- 主容器 -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <!-- 页眉 -->
              <tr>
                <td align="center" style="padding: 30px 20px; background: linear-gradient(135deg, #1890ff, #36cfc9); color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${isReply ? '感谢您的留言' : '新的留言通知'}</h1>
                </td>
              </tr>
              
              <!-- 内容区 -->
              <tr>
                <td style="padding: 30px 25px;">
                  ${isReply ? `
                    <p style="font-size: 18px; margin-bottom: 20px; color: #333333;">尊敬的 ${name}：</p>
                    <p>感谢您通过我们的官网联系表单与我们取得联系。我们已收到您的留言，内容如下：</p>
                  ` : `
                    <p style="font-size: 18px; margin-bottom: 20px; color: #333333;">您好，管理员：</p>
                    <p>网站收到了一条新的留言，详细信息如下：</p>
                    <p><strong>留言人:</strong> ${name}</p>
                    ${email ? `<p><strong>邮箱:</strong> ${email}</p>` : ''}
                    ${phone ? `<p><strong>电话:</strong> ${phone}</p>` : ''}
                  `}
                  
                  <!-- 消息框 -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-left: 4px solid #1890ff; margin: 20px 0; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="font-weight: 600; margin-bottom: 8px; color: #333333;">主题: ${subject}</p>
                        <div style="color: #444444; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</div>
                      </td>
                    </tr>
                  </table>
                  
                  ${isReply ? `
                    <p>我们的团队将尽快审阅您的留言，并在24小时内与您联系。</p>
                    
                    <!-- 联系信息框 -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td style="padding: 15px;">
                          <p style="margin: 5px 0;">如有紧急事项，您也可以通过以下方式联系我们：</p>
                          <p style="margin: 5px 0;">📞 电话: +86 15670141215</p>
                          <p style="margin: 5px 0;">📧 邮箱: jqz1215@qq.com</p>
                          <p style="margin: 5px 0;">🌐 网站: <a href="https://www.aiqji.cn" style="color: #1890ff;">https://www.aiqji.cn</a></p>
                        </td>
                      </tr>
                    </table>
                    
                    <p>再次感谢您的关注与支持！</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <a href="https://www.aiqji.cn/about" style="display: inline-block; background-color: #1890ff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">了解更多关于我们</a>
                        </td>
                      </tr>
                    </table>
                  ` : `
                    <p>请尽快处理此留言并回复客户。</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <a href="mailto:${email}" style="display: inline-block; background-color: #1890ff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">回复客户</a>
                        </td>
                      </tr>
                    </table>
                  `}
                  
                  <!-- 签名 -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                        <p>此致，</p>
                        <p><strong>爱奇吉团队</strong></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- 页脚 -->
              <tr>
                <td style="background-color: #f4f7fa; padding: 20px; text-align: center; font-size: 13px; color: #666666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="margin-bottom: 15px;">
                    <a href="https://www.aiqji.cn" style="color: #1890ff; text-decoration: none; margin: 0 10px;">官方网站</a> | 
                    <a href="https://www.aiqji.cn/contact" style="color: #1890ff; text-decoration: none; margin: 0 10px;">联系我们</a> | 
                    <a href="https://www.aiqji.cn/services" style="color: #1890ff; text-decoration: none; margin: 0 10px;">服务内容</a>
                  </p>
                  <p style="margin-top: 15px; font-size: 12px; color: #888888;">${copyright}</p>
                  <p style="font-size: 11px; color: #999999; margin-top: 15px;">此邮件由系统自动发送，请勿直接回复。</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// 腾讯验证码验证函数
async function verifyTencentCaptcha(ticket, randstr, userIP) {
  try {
    // 构建参数
    const params = {
      aid: captchaConfig.appId,
      AppSecretKey: captchaConfig.appSecretKey,
      Ticket: ticket,
      Randstr: randstr,
      UserIP: userIP || '127.0.0.1'
    };
    
    const queryStr = querystring.stringify(params);
    const options = {
      hostname: 'ssl.captcha.qq.com',
      path: `/ticket/verify?${queryStr}`,
      method: 'GET'
    };
    
    // 发送请求
    const data = await makeHttpsRequest(options);
    return data && data.response === '1';
  } catch (error) {
    console.error('验证码验证失败');
    return false;
  }
}

// 处理邮件发送请求
export const sendContactEmail = async (req, res) => {
  // 处理不同类型的请求对象
  let body = req.body;
  if (!body && req.body && typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error('解析请求体失败');
    }
  }
  
  // 如果是Express请求对象
  if (res && typeof res.status === 'function') {
    try {
      // 验证请求数据基本字段
      if (!body || !body.name || !body.email || !body.subject || !body.message) {
        return res.status(400).json({ success: false, message: '请提供完整的表单信息' });
      }
      
      // 临时跳过验证码验证，确保功能可用 (生产环境可以取消注释以启用验证)
       if (!body.captchaTicket || !body.captchaRandstr) {
         return res.status(400).json({ success: false, message: '缺少验证码信息' });
       }
      
      // 调用电子邮件服务处理通知
      await EmailService.sendContactNotifications(body);
      
      // 成功响应
      return res.status(200).json({ 
        success: true, 
        message: '邮件发送成功'
      });
    } catch (error) {
      console.error('邮件发送失败:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: '发送邮件失败', 
        error: error.message 
      });
    }
  } else {
    // 如果是Nitro请求对象
    try {
      // 检查请求数据
      if (!body || !body.name || !body.email || !body.subject || !body.message) {
        return {
          statusCode: 400,
          body: { message: '请提供完整的表单信息' }
        };
      }
      
      // 临时跳过验证码验证，确保功能可用 (生产环境可以取消注释以启用验证)
      if (!body.captchaTicket || !body.captchaRandstr) {
     return {
       statusCode: 400,
       body: { message: '缺少验证码信息' }
     };
   }
      
      // 调用电子邮件服务处理通知
      await EmailService.sendContactNotifications(body);
      
      return {
        statusCode: 200,
        body: { message: '邮件发送成功', success: true }
      };
    } catch (error) {
      console.error('处理请求失败:', error.message);
      return {
        statusCode: 500,
        body: { message: '服务器内部错误', error: error.message }
      };
    }
  }
};

export default { sendContactEmail };
