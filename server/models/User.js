import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '请提供用户名' },
      len: { args: [1, 50], msg: '用户名不能超过50个字符' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供密码' },
      len: { args: [6, 100], msg: '密码至少6个字符' }
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin',
    validate: {
      isIn: { args: [['admin']], msg: '角色无效' }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// 实例方法 - 生成JWT Token
User.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 实例方法 - 验证密码
User.prototype.matchPassword = async function(enteredPassword) {
  try {
    if (!enteredPassword || !this.password) {
      console.log('密码验证失败: 输入密码或存储密码为空');
      return false;
    }
    
    console.log('执行密码验证');
    console.log('输入密码长度:', enteredPassword.length);
    console.log('存储密码哈希前10个字符:', this.password.substring(0, 10) + '...');
    
    // 确保输入是字符串
    const passwordString = String(enteredPassword);
    
    const isMatch = await bcrypt.compare(passwordString, this.password);
    console.log('密码比较结果:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('密码验证错误:', error);
    return false;
  }
};

export default User;