// 数据库配置文件
// 主要配置
const mainConfig = {
  host: 'localhost',
  port: '3306',
  database: 'aiqiji',
  username: 'root',
  password: 'jiqingzhe', // 确保此密码与服务器端配置一致
  dialectOptions: {
    connectTimeout: 20000 // 增加连接超时时间
  },
  logging: false // 正式环境禁用日志
};

// 导出配置
export default mainConfig;

// 可选：如果当前配置无效，可以尝试使用以下备用配置之一
export const alternativeConfigs = {
  config1: {
    ...mainConfig,
    password: '' // 尝试空密码
  },
  config2: {
    ...mainConfig,
    host: '127.0.0.1' // 尝试IP地址而非localhost
  }
};