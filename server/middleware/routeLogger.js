/**
 * 路由日志中间件，记录每个请求的详细信息
 */
export const routeLogger = (req, res, next) => {
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} 请求开始`);
  console.log('请求头:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', JSON.stringify(req.body, null, 2));
  }
  
  // 捕获响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} 响应完成 ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

/**
 * 记录Express应用中所有路由的工具函数
 */
export const logAllRoutes = (app) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // 直接定义的路由
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter(method => middleware.route.methods[method])
        .join(',').toUpperCase();
      routes.push(`${methods} ${path}`);
    } else if (middleware.name === 'router') {
      // 通过router.use注册的路由器
      const baseRoute = middleware.regexp.toString()
        .replace('\\/?(?=\\/|$)', '')
        .replace(/^\^\\/, '')
        .replace(/\\\/\?\(\?\=\\\/\|\$\)$/, '')
        .replace(/\\\//g, '/');

      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods)
            .filter(method => handler.route.methods[method])
            .join(',').toUpperCase();
          routes.push(`${methods} ${baseRoute}${path}`);
        }
      });
    }
  });
  
  return routes.sort();
};
