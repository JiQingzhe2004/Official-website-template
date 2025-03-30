import express from 'express';
import User from '../models/User.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken'; // 添加缺少的导入

const router = express.Router();

// 创建日志目录和日志文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');
const authLogPath = path.join(logDir, 'auth.log');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志记录函数
const logAuth = (message, isError = false) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 追加到日志文件
  fs.appendFile(authLogPath, logMessage, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
  
  // 同时输出到控制台
  if (isError) {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
};

// @desc    登录用户
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    logAuth(`尝试登录: 用户名=${username}, 密码长度=${password ? password.length : 0}`);
    logAuth(`请求体内容: ${JSON.stringify(req.body)}`);

    // 验证输入
    if (!username || !password) {
      logAuth('登录失败: 用户名或密码为空');
      return res.status(400).json({ success: false, message: '请提供用户名和密码' });
    }

    // 检查用户是否存在
    const user = await User.findOne({ where: { username } });
    if (!user) {
      logAuth(`登录失败: 用户 "${username}" 不存在`);
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    logAuth(`找到用户: id=${user.id}, 用户名=${user.username}, 角色=${user.role}`);

    // 验证密码前先打印出存储的密码哈希前几个字符(安全考虑不打印全部)
    logAuth(`存储的密码哈希前10个字符: ${user.password.substring(0, 10)}...`);
    
    // 验证密码
    const isMatch = await user.matchPassword(password);
    logAuth(`密码验证结果: ${isMatch ? '成功' : '失败'}`);
    
    if (!isMatch) {
      logAuth(`登录失败: 用户 "${username}" 密码错误`);
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 创建token - 使用更长的过期时间
    const token = generateToken(user);
    logAuth(`登录成功: 为用户 ${username} 生成了新token，过期时间: ${process.env.JWT_EXPIRE || '30d'}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    logAuth(`登录处理异常: ${err.message}`, true);
    logAuth(`错误堆栈: ${err.stack}`, true);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取当前登录用户
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // 从req.user中获取用户ID
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    注册管理员用户（仅用于初始设置）
// @route   POST /api/auth/register
// @access  Public (应该限制为仅内部使用)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 创建用户
    const user = await User.create({
      username,
      password
    });

    // 创建token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加一个测试认证的简单端点
router.get('/test-auth', authenticateToken, (req, res) => {
  console.log('测试认证成功，用户ID:', req.user.id);
  res.json({
    success: true,
    message: '认证成功',
    userId: req.user.id
  });
});

// 验证令牌的路由
router.get('/verify', authenticateToken, (req, res) => {
  // 如果能通过authenticateToken中间件，则令牌有效
  return res.json({ 
    success: true, 
    message: '令牌有效',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// 刷新令牌的路由 - 修改为更健壮的实现
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '需要提供令牌'
      });
    }
    
    // 从环境变量获取密钥
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      logAuth('刷新令牌失败: JWT_SECRET环境变量未设置', true);
      return res.status(500).json({
        success: false,
        message: '服务器配置错误'
      });
    }
    
    try {
      // 尝试验证令牌，即使已过期
      const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
      logAuth(`刷新令牌: 尝试为用户ID=${decoded.id} 刷新`);
      
      // 查找用户以确保其仍然存在
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        logAuth(`刷新令牌失败: 未找到用户ID=${decoded.id}`, true);
        return res.status(404).json({
          success: false,
          message: '用户不存在或已被删除'
        });
      }
      
      // 生成新令牌
      const newToken = generateToken(user);
      logAuth(`刷新令牌成功: 为用户 ${user.username} 生成了新token`);
      
      return res.json({
        success: true,
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        message: '令牌已刷新'
      });
    } catch (error) {
      logAuth(`刷新令牌失败: ${error.message}`, true);
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }
  } catch (error) {
    logAuth(`刷新令牌处理异常: ${error.message}`, true);
    return res.status(500).json({
      success: false,
      message: '刷新令牌失败'
    });
  }
});

export default router;