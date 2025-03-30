import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Carousel = sequelize.define('Carousel', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供轮播图标题' },
      len: { args: [1, 100], msg: '标题不能超过100个字符' }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供轮播图描述' },
      len: { args: [1, 500], msg: '描述不能超过500个字符' }
    }
  },
  buttonText: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供按钮文本' },
      len: { args: [1, 50], msg: '按钮文本不能超过50个字符' }
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
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

export default Carousel;