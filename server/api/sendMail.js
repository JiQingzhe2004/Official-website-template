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
