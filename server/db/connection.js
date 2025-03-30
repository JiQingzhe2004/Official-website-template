const mysql = require('mysql2');
const config = require('../../src/config/dbConfig');

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
pool.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功!');
  connection.release();
});

module.exports = pool.promise();
