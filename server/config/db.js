
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import dbConfig from './dbConfig.js';

// 加载环境变量
dotenv.config();

// 创建Sequelize实例，优先使用dbConfig中的配置
const sequelize = new Sequelize(
  dbConfig.database || process.env.MYSQL_DATABASE || 'aiqiji',
  dbConfig.username || process.env.MYSQL_USER || 'root',
  dbConfig.password || process.env.MYSQL_PASSWORD || '',
  {
    host: dbConfig.host || process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    port: dbConfig.port || process.env.MYSQL_PORT || 3306,
    logging: console.log,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    define: {
      timestamps: true,
      underscored: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL数据库连接成功');
    console.log('连接配置:', {
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT
    });
  } catch (error) {
    console.error('MySQL数据库连接失败:', error);
    console.error('当前连接配置:', {
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT
    });
  }
};

export { sequelize, testConnection };