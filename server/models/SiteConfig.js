import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const SiteConfig = sequelize.define('SiteConfig', {
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    primaryKey: true,
    validate: {
      notEmpty: { msg: '配置键名不能为空' }
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: '配置值不能为空' }
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'text',
    validate: {
      isIn: { args: [['text', 'image', 'json', 'html']], msg: '类型无效' }
    }
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '/'
  }
}, {
  timestamps: true
});

export default SiteConfig;