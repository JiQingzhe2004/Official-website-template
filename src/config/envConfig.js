/**
 * 环境配置文件
 * 可根据不同环境使用不同的API地址
 */

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8181/api',
  },
  test: {
    API_BASE_URL: 'https://gwapi.aiqji.cn/api',
  },
  production: {
    API_BASE_URL: 'https://gwapi.aiqji.cn/api',
  }
};

// 获取当前环境，默认为production
const currentEnv = import.meta.env.MODE || 'production';

// 导出当前环境的配置
export default ENV[currentEnv];
