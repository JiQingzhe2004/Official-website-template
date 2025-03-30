import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取所有已注册的路由信息
 * @param {express.Application} app Express应用实例
 * @returns {Array} 已注册的路由信息
 */
export const getRegisteredRoutes = (app) => {
  const routes = [];
  
  // 对每个layer进行递归处理
  const processLayer = (layer, basePath = '') => {
    if (layer.route) {
      // 这是一个路由处理程序
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({
        path: basePath + layer.route.path,
        methods: methods,
        middleware: layer.route.stack.length
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // 这是一个路由器
      const routerPath = basePath + (layer.regexp.toString() !== /^\/?(?=\/|$)/i.toString() ? layer.regexp.toString() : '');
      layer.handle.stack.forEach(stackItem => {
        processLayer(stackItem, routerPath);
      });
    } else if (layer.name !== 'bound dispatch' && layer.name !== 'expressInit') {
      // 这可能是一个中间件
      routes.push({
        path: basePath + (layer.regexp.toString() !== /^\/?(?=\/|$)/i.toString() ? layer.regexp.toString() : '/*'),
        type: 'middleware',
        name: layer.name || 'anonymous'
      });
    }
  };
  
  // 处理主应用的stack
  app._router.stack.forEach(layer => {
    processLayer(layer);
  });
  
  return routes;
};

/**
 * 生成路由报告
 * @param {express.Application} app Express应用实例
 * @returns {String} 格式化的路由报告
 */
export const generateRouteReport = (app) => {
  const routes = getRegisteredRoutes(app);
  let report = '===== 爱奇吉 API 路由诊断报告 =====\n\n';
  
  // 分离API路由和中间件
  const apiRoutes = routes.filter(r => r.type !== 'middleware' && r.path.includes('/api'));
  const middlewares = routes.filter(r => r.type === 'middleware');
  
  report += '已注册的API路由：\n';
  apiRoutes.forEach(route => {
    report += `${route.methods.join(', ')} ${route.path}\n`;
  });
  
  report += '\n中间件：\n';
  middlewares.forEach(middleware => {
    report += `[${middleware.name}] ${middleware.path}\n`;
  });
  
  return report;
};

/**
 * 输出路由诊断报告
 * @param {express.Application} app Express应用实例
 */
export const outputRouteReport = (app) => {
  const report = generateRouteReport(app);
  console.log(report);
  
  // 将报告写入文件
  const reportPath = path.join(__dirname, '../logs/routes-report.txt');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  
  console.log(`路由报告已保存到: ${reportPath}`);
};

export default { getRegisteredRoutes, generateRouteReport, outputRouteReport };
