import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8181;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', apiRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '未找到请求的资源' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;