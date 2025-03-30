import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// 加载环境变量
dotenv.config();

// 异步自执行函数
(async () => {
  console.log('====== 数据库配置检查 ======');
  
  // 检查环境变量
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  
  console.log('数据库配置:');
  console.log(`- 主机: ${DB_HOST || '未设置'}`);
  console.log(`- 端口: ${DB_PORT || '未设置'}`);
  console.log(`- 用户名: ${DB_USER || '未设置'}`);
  console.log(`- 密码: ${DB_PASSWORD ? '已设置' : '未设置'}`);
  console.log(`- 数据库名: ${DB_NAME || '未设置'}`);
  
  // 检查数据库连接
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT || 3306,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    console.log('✅ 连接到MySQL服务器成功');
    
    // 检查数据库是否存在
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === DB_NAME);
    
    if (dbExists) {
      console.log(`✅ 数据库 "${DB_NAME}" 已存在`);
      
      // 使用指定的数据库
      await connection.query(`USE ${DB_NAME}`);
      
      // 检查表是否存在
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`数据库中的表:`);
      tables.forEach(table => {
        const tableName = table[`Tables_in_${DB_NAME}`];
        console.log(`- ${tableName}`);
      });
      
      // 检查CTA表
      const ctaTableExists = tables.some(table => {
        const tableName = table[`Tables_in_${DB_NAME}`];
        // 修改为检查正确的小写表名
        return tableName === 'cta';
      });
      
      if (ctaTableExists) {
        console.log(`✅ CTA表 "cta" 已存在`);
        
        // 获取表结构
        const [columns] = await connection.query('DESCRIBE cta');
        console.log(`CTA表结构:`);
        columns.forEach(column => {
          console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(非空)' : ''}`);
        });
        
        // 获取记录数量
        const [countResult] = await connection.query('SELECT COUNT(*) as count FROM cta');
        const count = countResult[0].count;
        console.log(`✅ CTA表中有 ${count} 条记录`);
      } else {
        console.log(`❌ CTA表 "cta" 不存在`);
        console.log('建议:');
        console.log('1. 重启服务器，让Sequelize自动创建表');
        console.log('2. 或手动运行 node server/diagnostic/api-check.js 创建表');
      }
    } else {
      console.log(`❌ 数据库 "${DB_NAME}" 不存在`);
      console.log(`需要创建数据库: CREATE DATABASE ${DB_NAME}`);
    }
    
    // 关闭连接
    await connection.end();
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
    console.log('建议:');
    console.log('1. 检查MySQL服务是否运行');
    console.log('2. 检查数据库连接信息是否正确');
    console.log('3. 确认数据库用户是否有足够权限');
  }
  
  console.log('====== 检查结束 ======');
})();
