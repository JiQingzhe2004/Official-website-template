import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 配置环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.STATIC_PORT || 8181;

// 提供静态文件
app.use(express.static(path.join(__dirname, '../dist')));

// 所有路由都返回index.html，以支持客户端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`静态文件服务器运行在端口: ${PORT}`);
});