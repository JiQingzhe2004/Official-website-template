import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 诊断上传服务
console.log('===== 上传服务诊断工具 =====');
console.log('检查必要的目录和权限...\n');

// 检查public目录
const publicDir = path.join(__dirname, '../../public');
let publicExists = fs.existsSync(publicDir);
console.log(`- public目录: ${publicExists ? '✅ 存在' : '❌ 不存在'}`);

if (!publicExists) {
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    publicExists = fs.existsSync(publicDir);
    console.log(`  ✅ 已创建public目录`);
  } catch (err) {
    console.log(`  ❌ 创建public目录失败: ${err.message}`);
  }
}

// 检查uploads子目录
const uploadsDir = path.join(publicDir, 'uploads');
let uploadsExists = fs.existsSync(uploadsDir);
console.log(`- uploads目录: ${uploadsExists ? '✅ 存在' : '❌ 不存在'}`);

if (!uploadsExists) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    uploadsExists = fs.existsSync(uploadsDir);
    console.log(`  ✅ 已创建uploads目录`);
  } catch (err) {
    console.log(`  ❌ 创建uploads目录失败: ${err.message}`);
  }
}

// 检查写入权限
let isWritable = false;
if (uploadsExists) {
  try {
    const testFile = path.join(uploadsDir, '.test-write-permission');
    fs.writeFileSync(testFile, 'test', { flag: 'w' });
    fs.unlinkSync(testFile);
    isWritable = true;
    console.log(`- 写入权限: ✅ 正常`);
  } catch (err) {
    console.log(`- 写入权限: ❌ 无法写入: ${err.message}`);
    console.log(`  提示: 请确保运行Node.js的用户对 ${uploadsDir} 有写入权限`);
  }
}

// 检查已上传文件
if (uploadsExists) {
  try {
    const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    console.log(`- 已上传文件: ${files.length} 个文件`);
    if (files.length > 0) {
      console.log(`  前5个文件: ${files.slice(0, 5).join(', ')}`);
    }
  } catch (err) {
    console.log(`- 读取文件列表失败: ${err.message}`);
  }
}

console.log('\n===== 诊断结果 =====');
if (publicExists && uploadsExists && isWritable) {
  console.log('✅ 上传服务目录结构检查通过!');
  console.log('✅ 服务应该可以正常工作');
} else {
  console.log('❌ 上传服务检查未通过，请解决上述问题');
}

console.log('\n建议操作:');
console.log('1. 确保服务器配置正确注册了/api/uploads路由');
console.log('2. 重启服务器以应用新的路由配置');
console.log('3. 使用API调试工具测试上传功能: /api/uploads/test');
