const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8181;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// API请求代理到现有的API服务器
// 如果您有API路由，请在此之前定义它们
// app.use('/api', apiRouter);

// 处理SPA路由 - 所有其他请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口: ${PORT}`);
});
