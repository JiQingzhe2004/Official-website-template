import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 验证JWT令牌的中间件
 */
export const authenticateToken = (req, res, next) => {
  console.log('【认证中间件】开始处理请求:', req.method, req.path);
  
  // 获取请求头中的token
  const authHeader = req.headers.authorization;
  console.log('【认证中间件】收到Authorization头:', authHeader ? `${authHeader.substring(0, 15)}...` : 'null');
  
  // 检查是否有Authorization头
  if (!authHeader) {
    console.error('【认证中间件】未提供Authorization头');
    return res.status(401).json({ 
      success: false, 
      message: '认证失败: 未提供认证头信息' 
    });
  }

  // 检查Authorization格式
  if (!authHeader.startsWith('Bearer ')) {
    console.error('【认证中间件】无效的Authorization格式');
    return res.status(401).json({ 
      success: false, 
      message: '认证失败: Authorization格式不正确，应为Bearer格式' 
    });
  }
  
  // 提取token
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.error('【认证中间件】Token为空');
    return res.status(401).json({ 
      success: false, 
      message: '认证失败: 令牌为空' 
    });
  }

  console.log('【认证中间件】提取的令牌:', token.substring(0, 10) + '...');
  console.log('【认证中间件】使用的JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('【认证中间件】成功验证token，用户信息:', JSON.stringify({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : '未知'
    }));
    
    // 将用户信息添加到req对象
    req.user = decoded;
    next();
  } catch (error) {
    // 提供更详细的错误信息
    let errorMessage = '无效的令牌';
    if (error.name === 'TokenExpiredError') {
      errorMessage = '令牌已过期';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = '令牌签名无效';
    }
    
    console.error(`【认证中间件】验证token时出错: ${error.name} - ${error.message}`);
    return res.status(401).json({ 
      success: false, 
      message: `认证失败: ${errorMessage}` 
    });
  }
};

/**
 * 生成JWT令牌
 * @param {Object} user - 用户对象
 * @returns {String} JWT令牌
 */
export const generateToken = (user) => {
  try {
    // 获取环境变量中的密钥，如果不存在则使用默认密钥
    const jwtSecret = process.env.JWT_SECRET || 'aiqiji_default_jwt_secret_key_please_change_in_production';
    
    // 从环境变量获取过期时间，默认为30天
    const jwtExpire = process.env.JWT_EXPIRE || '30d';
    
    if (!jwtSecret || jwtSecret.trim() === '') {
      console.error('JWT密钥未设置! 使用默认密钥(不推荐用于生产环境)');
    }
    
    console.log(`为用户 ${user.username} 生成令牌，有效期: ${jwtExpire}`);
    
    // 创建令牌有效载荷
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    // 签署令牌，使用环境变量中的过期时间
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });
  } catch (error) {
    console.error('生成令牌时出错:', error);
    throw new Error('令牌生成失败');
  }
};

/**
 * 确保导出了authenticate函数，改名为auth
 */
export const auth = async (req, res, next) => {
  // 认证逻辑
  authenticateToken(req, res, next);
};

/**
 * 添加authenticate作为别名
 */
export const authenticate = auth;