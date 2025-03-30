import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const WhyUs = sequelize.define('WhyUs', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供标题' },
      len: { args: [1, 100], msg: '标题不能超过100个字符' }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供描述' },
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

export default WhyUs;