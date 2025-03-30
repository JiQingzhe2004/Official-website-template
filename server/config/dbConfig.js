export default {
  host: 'localhost',
  port: '3306',
  database: 'aiqiji',
  username: 'root',
  password: 'jiqingzhe',  // 修改为正确的密码
  dialectOptions: {
    connectTimeout: 20000 // 增加连接超时时间
  },
  logging: false // 生产环境禁用SQL查询日志
};