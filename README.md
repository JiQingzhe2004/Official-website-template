# 官网模板项目

这是一个基于React和Vite构建的Web应用项目。

## 技术栈

- 前端：React + Vite
- 后端：Node.js

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 运行项目

运行前端开发服务器:
```bash
npm run dev
```

运行后端服务器:
```bash
npm run server
# 或直接运行
node server/server.js
```

## 部署指南

### 1. API地址和请求头管理

部署前，需要先配置API地址和请求头:

1. 打开 `src/api/config.js` 文件，设置正确的API地址:
   ```js
   // 生产环境API地址
   export const API_BASE_URL = 'https://您的域名/api';
   // 开发环境可使用
   // export const API_BASE_URL = 'http://localhost:8181/api';
   ```

2. 检查请求头配置，确保适用于生产环境:
   ```js
   // src/api/request.js
   // 确保请求头设置正确
   const headers = {
     'Content-Type': 'application/json',
     // 其他必要的请求头...
   };
   ```

### 2. 打包前端应用

```bash
npm run build
```

打包后的文件将生成在 `dist` 文件夹中，包含所有静态资源。

### 3. 部署流程

#### 前端部署:
1. 将 `dist` 目录下的所有文件上传到Web服务器的根目录。
2. 配置Web服务器(Nginx、Apache等)指向这些文件。

#### 后端部署:
1. 将 `server` 文件夹上传到服务器。
2. 进入server目录并安装依赖（必须安装，否则项目无法运行）:
   ```bash
   cd server
   npm install
   ```
3. 运行后端服务:
   ```bash
   # 使用PM2等进程管理工具运行
   pm2 start server.js
   
   # 或者直接运行
   node server.js
   ```

### 4. 数据库初始化

前端和后端部署完成后，通过浏览器访问:

```
https://您的域名/install
```

此路径会触发数据库初始化流程，包括创建必要的表和初始数据。

### 5. 验证部署

访问您的域名，确认应用已成功部署并正常运行。

## 项目结构

- `src/` - 前端源代码
- `server/` - 后端服务代码
- `public/` - 静态资源

## 注意事项

- 确保服务器已安装Node.js (推荐v16+)
- 确保数据库配置正确 (MySQL/MongoDB等)
- 部署前请备份重要数据

## 扩展ESLint配置

如果你正在开发生产应用程序，我们建议使用TypeScript并启用类型感知的lint规则。查看[TS模板](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)以在项目中集成TypeScript和[`typescript-eslint`](https://typescript-eslint.io)。


# 移除所有文件的缓存（保留物理文件）
git rm -r --cached .

# 重新添加所有文件（此时 Git 会遵守 .gitignore）
git add .