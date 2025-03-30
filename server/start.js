import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePortReport } from './diagnostic/port-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保日志目录存在
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 启动前进行端口诊断
const runPortDiagnostic = async () => {
  const configPort = process.env.PORT || 8181;
  const report = await generatePortReport(parseInt(configPort, 10));
  console.log(report);
  
  // 将报告写入文件
  fs.writeFileSync(path.join(logDir, 'port-report.txt'), report);
};

// 启动服务器
const startServer = () => {
  console.log('正在启动服务器...');
  
  // 使用nodemon启动服务器以实现热重载
  const serverProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production'
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('启动服务器时发生错误:', error);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`服务器进程退出，代码: ${code}`);
    }
  });
};

// 主函数
const main = async () => {
  try {
    console.log('===== 爱奇吉服务器启动程序 =====');
    await runPortDiagnostic();
    startServer();
  } catch (error) {
    console.error('启动过程中出错:', error);
    process.exit(1);
  }
};

// 执行主函数
main();
