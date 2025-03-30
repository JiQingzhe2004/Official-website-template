const cors = require('cors');

// 配置 CORS 中间件
const corsOptions = {
  origin: ['https://www.aiqji.cn', 'http://localhost:8080'], // 允许这两个源访问
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
