import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: '菜单标题不能为空' }
    }
  },
  path: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '菜单路径不能为空' }
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  position: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'top',
    validate: {
      isIn: { args: [['top', 'bottom']], msg: '位置无效' }
    }
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_external: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true
});

// 自关联关系
MenuItem.belongsTo(MenuItem, { as: 'parent', foreignKey: 'parent_id' });
MenuItem.hasMany(MenuItem, { as: 'children', foreignKey: 'parent_id' });

export default MenuItem;