import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// 检查表是否存在的辅助函数
const checkTableExists = async (tableName) => {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?;
    `;
    const [results] = await sequelize.query(query, { 
      replacements: [tableName],
      type: sequelize.QueryTypes.SELECT 
    });
    return results.count > 0;
  } catch (error) {
    console.error(`检查表 ${tableName} 是否存在时出错:`, error);
    return false;
  }
};

// 定义CTA模型
const CTA = sequelize.define('CTA', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: '请提供CTA标题' },
      len: { args: [1, 100], msg: '标题不能超过100个字符' }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '',
    validate: {
      len: { args: [0, 500], msg: '描述不能超过500个字符' }
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
  link: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '/contact',
    validate: {
      notEmpty: { msg: '请提供链接地址' }
    }
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'primary',
    validate: {
      isIn: {
        args: [['primary', 'secondary', 'tertiary']],
        msg: '类型必须是primary、secondary或tertiary'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'cta',
  freezeTableName: true,
  timestamps: true,
  charset: 'utf8mb4',  // 添加默认字符集
  collate: 'utf8mb4_unicode_ci', // 添加默认排序规则
  hooks: {
    beforeValidate: (instance) => {
      // 确保链接格式正确
      if (instance.link && !instance.link.startsWith('http') && !instance.link.startsWith('/')) {
        instance.link = `/${instance.link}`;
      }
    }
  }
});

// 初始化函数
const initCTAModel = async () => {
  try {
    const tableExists = await checkTableExists('cta');
    console.log(`CTA表存在状态: ${tableExists}`);
    
    if (!tableExists) {
      console.log('正在创建CTA表...');
      await CTA.sync({ force: false });
      console.log('CTA表已创建');
    } else {
      console.log('CTA表已存在，跳过创建');
    }
  } catch (error) {
    console.error('初始化CTA模型时出错:', error);
  }
};

// 执行初始化
initCTAModel();

export default CTA;