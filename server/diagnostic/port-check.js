import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 检查端口是否被占用
 * @param {Number} port 要检查的端口号
 * @returns {Promise<boolean>} 端口是否已被占用
 */
export const isPortInUse = async (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // 端口已被占用
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // 关闭服务器，因为我们只是检查端口
      server.close();
      resolve(false); // 端口未被占用
    });
    
    server.listen(port);
  });
};

/**
 * 检查Nginx配置中的代理端口
 * @returns {Object} Nginx配置信息
 */
export const checkNginxConfig = () => {
  try {
    const nginxConfigPath = path.join(__dirname, '../../nginx.conf');
    if (!fs.existsSync(nginxConfigPath)) {
      return { error: 'Nginx配置文件不存在' };
    }
    
    const config = fs.readFileSync(nginxConfigPath, 'utf8');
    const proxyMatch = config.match(/proxy_pass\s+http:\/\/localhost:(\d+)/);
    const port = proxyMatch ? proxyMatch[1] : null;
    
    return {
      found: !!port,
      port: port ? parseInt(port, 10) : null,
      config: proxyMatch ? proxyMatch[0] : null
    };
  } catch (error) {
    return { error: `读取Nginx配置失败: ${error.message}` };
  }
};

/**
 * 进行全面的端口检查
 * @param {Number} configuredPort 配置的端口号
 * @returns {Object} 检查结果
 */
export const runPortDiagnostic = async (configuredPort = 8181) => {
  const results = {
    configured: configuredPort,
    inUse: await isPortInUse(configuredPort),
    nginx: checkNginxConfig(),
    alternatives: []
  };
  
  // 检查一些常用替代端口
  const commonPorts = [3000, 8080, 8181, 8000, 5000];
  for (const port of commonPorts) {
    if (port !== configuredPort) {
      results.alternatives.push({
        port,
        inUse: await isPortInUse(port)
      });
    }
  }
  
  return results;
};

/**
 * 生成端口诊断报告
 * @param {Number} configuredPort 配置的端口号
 */
export const generatePortReport = async (configuredPort = 8181) => {
  const results = await runPortDiagnostic(configuredPort);
  let report = '===== 端口配置诊断报告 =====\n\n';
  
  report += `配置端口: ${results.configured} (${results.inUse ? '已被占用' : '可用'})\n\n`;
  
  report += 'Nginx配置:\n';
  if (results.nginx.error) {
    report += `  错误: ${results.nginx.error}\n`;
  } else if (!results.nginx.found) {
    report += '  未找到代理配置\n';
  } else {
    report += `  代理到端口: ${results.nginx.port} (${results.nginx.config})\n`;
    
    // 检查Nginx配置的端口是否与实际端口匹配
    if (results.nginx.port !== configuredPort) {
      report += `  ⚠️ 警告: Nginx代理端口(${results.nginx.port})与配置端口(${configuredPort})不匹配\n`;
    }
  }
  
  report += '\n可用替代端口:\n';
  results.alternatives
    .filter(alt => !alt.inUse)
    .forEach(alt => {
      report += `  ✓ ${alt.port}\n`;
    });
  
  report += '\n已占用的端口:\n';
  results.alternatives
    .filter(alt => alt.inUse)
    .forEach(alt => {
      report += `  × ${alt.port}\n`;
    });
  
  return report;
};

export default { isPortInUse, checkNginxConfig, runPortDiagnostic, generatePortReport };
