import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Service = sequelize.define('Service', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供服务标题' },
      len: { args: [1, 100], msg: '标题不能超过100个字符' }
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供图标名称' }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供服务描述' },
      len: { args: [1, 500], msg: '描述不能超过500个字符' }
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default Service;