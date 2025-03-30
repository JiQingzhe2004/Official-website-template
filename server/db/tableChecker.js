import { sequelize } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 检查数据库表是否存在
 * @param {string} tableName 表名
 * @returns {Promise<boolean>} 表是否存在
 */
export const checkTableExists = async (tableName) => {
  try {
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = ?;
    `, {
      replacements: [tableName],
      type: sequelize.QueryTypes.SELECT
    });
    
    return results.count > 0;
  } catch (error) {
    console.error(`检查表 ${tableName} 是否存在时出错:`, error);
    return false;
  }
};

/**
 * 检查并创建CTA表
 * @returns {Promise<boolean>} 是否成功创建或表已存在
 */
export const ensureCTATable = async () => {
  try {
    const tableExists = await checkTableExists('cta');
    
    if (!tableExists) {
      console.log('CTA表不存在，正在创建...');
      
      // 执行创建表的SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS \`cta\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(100) NOT NULL,
          \`description\` VARCHAR(500) NULL DEFAULT '',
          \`buttonText\` VARCHAR(50) NOT NULL,
          \`link\` VARCHAR(255) NOT NULL,
          \`type\` VARCHAR(20) NOT NULL DEFAULT 'primary',
          \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
          \`order\` INT NOT NULL DEFAULT 0,
          \`createdAt\` DATETIME NOT NULL,
          \`updatedAt\` DATETIME NOT NULL,
          PRIMARY KEY (\`id\`));
      `;
      
      await sequelize.query(createTableSQL);
      console.log('CTA表创建成功');
      
      return true;
    }
    
    console.log('CTA表已存在');
    return true;
  } catch (error) {
    console.error('确保CTA表存在时出错:', error);
    return false;
  }
};

/**
 * 检查并修复所有数据库表
 */
export const checkAndRepairAllTables = async () => {
  try {
    console.log('正在检查数据库表...');
    
    // 获取所有模型
    const modelsPath = path.join(__dirname, '..', 'models');
    const modelFiles = fs.readdirSync(modelsPath).filter(file => 
      file.endsWith('.js') && file !== 'index.js'
    );
    
    // 检查每个模型对应的表
    for (const modelFile of modelFiles) {
      const modelName = modelFile.replace('.js', '');
      const tableName = modelName.toLowerCase();
      
      console.log(`检查表: ${tableName}`);
      const tableExists = await checkTableExists(tableName);
      
      if (!tableExists) {
        try {
          // 动态导入模型
          const modelPath = `../models/${modelFile}`;
          const { default: Model } = await import(modelPath);
          
          console.log(`表 ${tableName} 不存在，正在创建...`);
          await Model.sync({ force: false });
          console.log(`表 ${tableName} 创建成功`);
        } catch (err) {
          console.error(`创建表 ${tableName} 失败:`, err);
        }
      } else {
        console.log(`表 ${tableName} 已存在`);
      }
    }
    
    console.log('数据库表检查完成');
    return true;
  } catch (error) {
    console.error('检查和修复数据库表时出错:', error);
    return false;
  }
};

/**
 * 记录表结构
 * @param {string} tableName 表名
 */
export const logTableStructure = async (tableName) => {
  try {
    console.log(`获取表 ${tableName} 结构...`);
    
    // 获取表结构
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM \`${tableName}\`
    `);
    
    console.log(`表 ${tableName} 结构:`, columns);
    return columns;
  } catch (error) {
    console.error(`获取表 ${tableName} 结构时出错:`, error);
    return [];
  }
};

export default {
  checkTableExists,
  ensureCTATable,
  checkAndRepairAllTables,
  logTableStructure
};
