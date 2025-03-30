import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * 专用于修改密码的路由
 * @route   PUT /api/change-password
 * @access  Private
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    console.log('【独立密码修改API】请求处理中');
    
    const { currentPassword, newPassword } = req.body;
    console.log('【独立密码修改API】收到数据:', { 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword 
    });
    
    // 验证输入
    if (!currentPassword || !newPassword) {
      console.log('【独立密码修改API】错误: 缺少必要参数');
      return res.status(400).json({ 
        success: false, 
        message: '请提供当前密码和新密码' 
      });
    }
    
    // 密码长度验证
    if (newPassword.length < 6) {
      console.log('【独立密码修改API】错误: 新密码太短');
      return res.status(400).json({ 
        success: false, 
        message: '新密码至少需要6个字符' 
      });
    }
    
    // 获取用户
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.log('【独立密码修改API】错误: 用户不存在');
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    // 验证当前密码
    const isMatch = await user.matchPassword(currentPassword);
    console.log('【独立密码修改API】密码验证:', isMatch ? '成功' : '失败');
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '当前密码不正确' 
      });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    console.log('【独立密码修改API】密码更新成功');
    
    return res.status(200).json({
      success: true,
      message: '密码修改成功'
    });
  } catch (err) {
    console.error('【独立密码修改API】错误:', err);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + (err.message || '未知错误') 
    });
  }
});

export default router;
