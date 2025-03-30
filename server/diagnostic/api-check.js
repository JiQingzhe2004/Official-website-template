import { sequelize } from '../config/db.js';
import CTA from '../models/CTA.js';

// 异步自执行函数
(async () => {
  console.log('====== 开始API诊断 ======');
  
  // 1. 检查数据库连接
  try {
    console.log('正在测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接正常');
    
    // 检查数据库字符集
    const dbCharset = await sequelize.query(
      `SELECT @@character_set_database AS charset, @@collation_database AS collation`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (dbCharset && dbCharset.length > 0) {
      console.log(`数据库默认字符集: ${dbCharset[0].charset}, 排序规则: ${dbCharset[0].collation}`);
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('请检查数据库配置信息是否正确:');
    console.log('- 主机名、端口是否正确');
    console.log('- 用户名和密码是否正确');
    console.log('- 数据库名是否存在');
    return;
  }
  
  // 2. 检查CTA表
  console.log('\n====== 检查CTA表 ======');
  try {
    // 检查表是否存在
    const tableInfo = await sequelize.query(
      `SELECT * FROM information_schema.tables 
       WHERE table_schema = DATABASE() 
       AND table_name = 'cta'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ CTA表已存在，表名为：cta');
      
      // 检查表字符集
      const tableCharset = await sequelize.query(
        `SELECT TABLE_COLLATION FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'cta'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (tableCharset && tableCharset.length > 0) {
        console.log(`表排序规则: ${tableCharset[0].TABLE_COLLATION}`);
      }
      
      // 检查表结构
      const columns = await sequelize.query(
        `SHOW COLUMNS FROM cta`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('表结构:');
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type}`);
      });
      
      // 检查记录数量
      const count = await CTA.count();
      console.log(`✅ CTA表中有 ${count} 条记录`);
      
      if (count === 0) {
        console.log('⚠️ CTA表为空，创建初始数据...');
        try {
          const defaultCta = await CTA.create({
            title: '准备好开始您的项目了吗？',
            description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
            buttonText: '立即联系',
            link: '/contact',
            isActive: true
          });
          console.log('✅ 已创建示例CTA记录，ID:', defaultCta.id);
        } catch (createError) {
          console.error('❌ 创建示例记录失败:', createError.message);
        }
      }
    } else {
      console.log('❌ CTA表不存在，需要创建');
      
      // 尝试创建表
      try {
        await CTA.sync({ force: false });
        console.log('✅ 已创建CTA表结构');
        
        // 创建示例数据
        const defaultCta = await CTA.create({
          title: '准备好开始您的项目了吗？',
          description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
          buttonText: '立即联系',
          link: '/contact',
          isActive: true
        });
        console.log('✅ 已创建示例CTA记录');
      } catch (syncError) {
        console.error('❌ 表创建失败:', syncError.message);
        console.log('建议: 使用指定字符集初始化表，例如:');
        console.log('ALTER TABLE cta CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      }
    }
  } catch (error) {
    console.error('❌ 检查表失败:', error.message);
    console.log('可能是字符集冲突问题，建议使用管理工具手动初始化并指定字符集');
  }
  
  console.log('====== 诊断完成 ======');
})();
