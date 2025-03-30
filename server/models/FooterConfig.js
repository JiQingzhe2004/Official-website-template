import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const FooterConfig = sequelize.define('FooterConfig', {
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'footer_config',
  timestamps: true
});

export default FooterConfig;
