import nodemailer from 'nodemailer';
import axios from 'axios';

/**
 * 电子邮件服务类
 * 处理与邮件发送相关的所有功能
 */
class EmailService {
  /**
   * 创建QQ邮箱发送器
   */
  static createTransporter() {
    return nodemailer.createTransport({
      service: 'QQ',
      auth: {
        user: '304028273@qq.com',
        pass: 'ceiototnzquicafe' // QQ邮箱授权码
      }
    });
  }

  /**
   * 获取网站版权信息
   */
  static async getCopyrightInfo() {
    try {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
      const response = await axios.get(`${baseUrl}/api/siteconfig/copyright`);
      
      if (response.data && response.data.value) {
        return response.data.value;
      }
      
      return `© ${new Date().getFullYear()} 爱奇吉科技. 保留所有权利.`;
    } catch (error) {
      console.error('获取版权信息失败');
      return `© ${new Date().getFullYear()} 爱奇吉科技. 保留所有权利.`;
    }
  }

  /**
   * 创建美化的管理员通知邮件
   */
  static async createAdminEmailTemplate(name, subject, message, email, phone) {
    const copyright = await this.getCopyrightInfo();
    const primaryColor = '#1890ff';
    
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>新的留言通知</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; background-color: #f4f7fa;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f7fa">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <!-- 页眉 -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background: linear-gradient(135deg, #1890ff, #36cfc9); color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">新的官网留言</h1>
                  </td>
                </tr>
                
                <!-- 内容区 -->
                <tr>
                  <td style="padding: 30px 25px;">
                    <p style="font-size: 18px; margin-bottom: 20px; color: #333333;">您好，管理员：</p>
                    <p style="margin: 10px 0;">网站刚刚收到了一条新的留言，详细信息如下：</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td style="padding: 15px;">
                          <p style="margin: 5px 0;"><strong>姓名:</strong> ${name}</p>
                          <p style="margin: 5px 0;"><strong>邮箱:</strong> ${email}</p>
                          <p style="margin: 5px 0;"><strong>电话:</strong> ${phone || '未提供'}</p>
                          <p style="margin: 5px 0;"><strong>时间:</strong> ${new Date().toLocaleString()}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-left: 4px solid #1890ff; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="font-weight: 600; margin-bottom: 8px; color: #333333;">主题: ${subject}</p>
                          <div style="color: #444444; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 10px 0;">请及时处理该留言并与客户取得联系。</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <a href="mailto:${email}" style="display: inline-block; background-color: #1890ff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">回复此留言</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- 页脚 -->
                <tr>
                  <td style="background-color: #f4f7fa; padding: 20px; text-align: center; font-size: 13px; color: #666666; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="margin-top: 15px; font-size: 12px; color: #888888;">${copyright}</p>
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

  /**
   * 创建美化的用户回复邮件
   */
  static async createUserEmailTemplate(name, subject, message) {
    const copyright = await this.getCopyrightInfo();
    const primaryColor = '#1890ff';
    const secondaryColor = '#36cfc9';
    
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>感谢您的留言</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', 'Microsoft YaHei', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; background-color: #f4f7fa;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f7fa">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <!-- 页眉 -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background: linear-gradient(135deg, #1890ff, #36cfc9); color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">感谢您的留言</h1>
                  </td>
                </tr>
                
                <!-- 内容区 -->
                <tr>
                  <td style="padding: 30px 25px;">
                    <p style="font-size: 18px; margin-bottom: 20px; color: #333333;">尊敬的 ${name}：</p>
                    <p style="margin: 10px 0;">感谢您通过我们的官网联系表单与我们取得联系。我们已收到您的留言，内容如下：</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f8f8; border-left: 4px solid #1890ff; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="font-weight: 600; margin-bottom: 8px; color: #333333;">主题: ${subject}</p>
                          <div style="color: #444444; line-height: 1.5;">${message.replace(/\n/g, '<br/>')}</div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 10px 0;">我们的团队将尽快审阅您的留言，并在24小时内与您联系。</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td style="padding: 15px;">
                          <p style="margin: 5px 0;">如有紧急事项，您也可以通过以下方式联系我们：</p>
                          <p style="margin: 5px 0;">📞 电话: +86 15670141215</p>
                          <p style="margin: 5px 0;">📧 邮箱: jqz1215@qq.com</p>
                          <p style="margin: 5px 0;">🌐 网站: <a href="https://www.aiqji.cn" style="color: #1890ff; text-decoration: none;">https://www.aiqji.cn</a></p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 10px 0;">再次感谢您的关注与支持！</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <a href="https://www.aiqji.cn/about" style="display: inline-block; background-color: #1890ff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">了解更多关于我们</a>
                        </td>
                      </tr>
                    </table>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                          <p style="margin: 10px 0;">此致，</p>
                          <p style="margin: 10px 0;"><strong>爱奇吉团队</strong></p>
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

  /**
   * 发送留言通知和自动回复
   */
  static async sendContactNotifications(contactData) {
    try {
      const { name, email, phone, subject, message } = contactData;
      
      // 创建发送器
      const transporter = this.createTransporter();
      
      // 获取邮件模板
      const adminEmailHtml = await this.createAdminEmailTemplate(name, subject, message, email, phone);
      const userEmailHtml = await this.createUserEmailTemplate(name, subject, message);

      // 向管理员发送通知
      await transporter.sendMail({
        from: { name: '爱奇吉官网', address: '304028273@qq.com' },
        to: '304028273@qq.com',
        subject: `官网留言: ${subject}`,
        html: adminEmailHtml
      });
      
      // 向用户发送自动回复
      await transporter.sendMail({
        from: { name: '爱奇吉官网', address: '304028273@qq.com' },
        to: email,
        subject: '感谢您的留言【爱奇吉】',
        html: userEmailHtml
      });
      
      return { success: true };
    } catch (error) {
      console.error('邮件发送失败:', error.message);
      throw error;
    }
  }
}

export default EmailService;
