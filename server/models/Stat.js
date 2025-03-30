import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Stat = sequelize.define('Stat', {
  number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供统计数字' },
      len: { args: [1, 20], msg: '数字不能超过20个字符' }
    }
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供统计标题' },
      len: { args: [1, 50], msg: '标题不能超过50个字符' }
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

export default Stat;