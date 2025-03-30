import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '页面标题不能为空' }
    }
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '页面路径不能为空' }
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  meta_title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    allowNull: false,
    defaultValue: 'draft'
  },
  template: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'default'
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否为系统页面，系统页面不可删除'
  }
}, {
  timestamps: true
});

export default Page;