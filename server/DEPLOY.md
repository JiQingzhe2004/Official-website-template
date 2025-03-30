# 服务器部署说明

## 前置要求
- Node.js 14+
- MySQL 或者其他配置的数据库

## 部署步骤

1. **上传文件**
   - 将整个`server`文件夹上传到服务器

2. **安装依赖**
   ```bash
   cd server
   npm install
   ```

3. **配置环境变量**
   - 在`server`文件夹中创建`.env`文件
   - 参考`.env.example`填写必要的配置信息

4. **启动服务**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

5. **使用PM2管理进程(推荐)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "aiqiji-api" -- start
   pm2 save
   ```

6. **检查服务状态**
   - 访问 `http://your-server:3000/health` 确认API是否正常运行

## 常见问题排查

1. **JWT令牌问题**
   - 确保在`.env`文件中设置了`JWT_SECRET`和`JWT_EXPIRE`
   - 检查服务器日志中是否有JWT相关错误

2. **数据库连接问题**
   - 验证数据库连接信息是否正确
   - 确保服务器可以访问数据库

3. **端口占用问题**
   - 默认端口是3000，如果被占用，在`.env`中修改`PORT`值

## 日志文件位置
- 访问日志: `server/logs/access.log`
- 认证日志: `server/logs/auth.log`
- 错误日志: 通过PM2查看或在控制台输出

## 注意事项
- 生产环境中请使用HTTPS
- 定期备份数据库
- 确保服务器系统保持更新
