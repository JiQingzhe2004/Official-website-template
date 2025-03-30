import express from 'express';
import CTA from '../models/CTA.js';
import { auth } from '../middleware/auth.js';
import { sequelize } from '../config/db.js';

const router = express.Router();

/**
 * 获取所有CTA记录
 */
router.get('/all', async (req, res) => {
  try {
    console.log('API: 获取所有CTA记录');
    
    const ctas = await CTA.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });
    
    console.log(`找到 ${ctas.length} 条CTA记录`);
    return res.json({ success: true, data: ctas });
  } catch (error) {
    console.error('获取CTA列表失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message
    });
  }
});

/**
 * 获取当前激活的CTA
 */
router.get('/active', async (req, res) => {
  try {
    console.log('API: 获取激活的CTA');
    const activeCta = await CTA.findOne({ 
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });
    
    if (!activeCta) {
      // 如果没有激活的CTA，返回第一条记录
      const firstCta = await CTA.findOne({
        order: [['createdAt', 'DESC']]
      });
      
      if (firstCta) {
        console.log('未找到激活的CTA，返回最新记录');
        return res.json({ success: true, data: firstCta });
      }
      
      return res.status(404).json({ 
        success: false, 
        message: '没有找到任何CTA记录' 
      });
    }
    
    console.log('找到激活的CTA:', activeCta.id);
    return res.json({ success: true, data: activeCta });
  } catch (error) {
    console.error('获取激活CTA失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 设置激活的CTA
 */
router.put('/setActive/:id', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`API: 设置ID为 ${id} 的CTA为激活状态`);
    
    // 首先检查目标CTA是否存在
    const targetCta = await CTA.findByPk(id, { transaction });
    if (!targetCta) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的CTA' 
      });
    }
    
    // 将所有CTA设为非激活
    await CTA.update(
      { isActive: false }, 
      { where: {}, transaction }
    );
    
    // 将指定CTA设为激活
    await targetCta.update(
      { isActive: true },
      { transaction }
    );
    
    await transaction.commit();
    
    return res.json({ 
      success: true, 
      message: `ID为 ${id} 的CTA已设置为激活状态`,
      data: targetCta
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`设置激活CTA失败:`, error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 根据ID获取CTA
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`API: 获取ID为 ${id} 的CTA`);
    
    const cta = await CTA.findByPk(id);
    if (!cta) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的CTA' 
      });
    }
    
    return res.json({ success: true, data: cta });
  } catch (error) {
    console.error(`获取CTA(ID:${req.params.id})失败:`, error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 创建CTA
 */
router.post('/', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('API: 创建新CTA');
    console.log('请求数据:', req.body);
    
    // 验证必填字段
    const { title, buttonText } = req.body;
    if (!title || !buttonText) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '标题和按钮文本为必填项' 
      });
    }
    
    const newCta = await CTA.create(req.body, { transaction });
    
    await transaction.commit();
    console.log('新CTA创建成功:', newCta.id);
    
    return res.status(201).json({ success: true, data: newCta });
  } catch (error) {
    await transaction.rollback();
    console.error('创建CTA失败:', error);
    
    // 错误分类处理
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: '数据验证失败', 
        errors: validationErrors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 更新CTA
 */
router.put('/:id', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`API: 更新ID为 ${id} 的CTA`);
    
    const cta = await CTA.findByPk(id, { transaction });
    if (!cta) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的CTA' 
      });
    }
    
    await cta.update(req.body, { transaction });
    
    await transaction.commit();
    return res.json({ success: true, data: cta });
  } catch (error) {
    await transaction.rollback();
    console.error(`更新CTA(ID:${req.params.id})失败:`, error);
    
    // 错误分类处理
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: '数据验证失败', 
        errors: validationErrors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 删除CTA
 */
router.delete('/:id', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`API: 删除ID为 ${id} 的CTA`);
    
    const cta = await CTA.findByPk(id, { transaction });
    if (!cta) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false, 
        message: '找不到指定的CTA' 
      });
    }
    
    // 如果是当前活跃的CTA，不允许删除
    if (cta.isActive) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: '不能删除当前活跃使用的CTA，请先激活其他CTA' 
      });
    }
    
    await cta.destroy({ transaction });
    
    await transaction.commit();
    return res.json({ 
      success: true, 
      message: '删除成功',
      data: { id }
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`删除CTA(ID:${req.params.id})失败:`, error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 获取CTA列表（默认路由）
 */
router.get('/', async (req, res) => {
  try {
    console.log('API: 获取CTA列表(默认路由)');
    const ctas = await CTA.findAll({
      order: [
        ['order', 'ASC'],
        ['updatedAt', 'DESC']
      ]
    });
    return res.json({ success: true, data: ctas });
  } catch (error) {
    console.error('获取CTA列表失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误: ' + error.message 
    });
  }
});

/**
 * 手动初始化CTA表
 */
router.post('/initialize', auth, async (req, res) => {
  try {
    console.log('API: 初始化CTA表');
    
    // 获取字符集和排序规则参数
    const { charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci' } = req.body;
    console.log(`使用字符集: ${charset}, 排序规则: ${collate}`);
    
    const results = [];
    results.push({ status: 'info', message: `ℹ️ 使用字符集: ${charset}, 排序规则: ${collate}` });
    
    // 1. 检查数据库连接
    try {
      await sequelize.authenticate();
      results.push({ status: 'success', message: '✅ 数据库连接正常' });
      
      // 检查数据库字符集
      const dbCharset = await sequelize.query(
        `SELECT @@character_set_database AS charset, @@collation_database AS collation`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (dbCharset && dbCharset.length > 0) {
        results.push({ 
          status: 'info', 
          message: `ℹ️ 数据库默认字符集: ${dbCharset[0].charset}, 排序规则: ${dbCharset[0].collation}` 
        });
      }
    } catch (dbError) {
      return res.status(500).json({ 
        success: false, 
        message: '数据库连接失败: ' + dbError.message,
        logs: results 
      });
    }
    
    // 2. 检查表是否存在
    const tableInfo = await sequelize.query(
      `SELECT * FROM information_schema.tables 
       WHERE table_schema = DATABASE() 
       AND table_name = 'cta'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    let tableExists = tableInfo && tableInfo.length > 0;
    if (tableExists) {
      results.push({ status: 'success', message: '✅ CTA表已存在' });
      
      // 检查表结构
      const columns = await sequelize.query(
        `SHOW COLUMNS FROM cta`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      let columnsInfo = '表结构:\n';
      columns.forEach(col => {
        columnsInfo += `- ${col.Field}: ${col.Type}\n`;
      });
      results.push({ status: 'info', message: columnsInfo });
      
      // 检查表字符集
      const tableCharset = await sequelize.query(
        `SELECT TABLE_COLLATION FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'cta'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (tableCharset && tableCharset.length > 0) {
        results.push({ 
          status: 'info', 
          message: `ℹ️ 当前表排序规则: ${tableCharset[0].TABLE_COLLATION}` 
        });
      }
      
      // 尝试修改表的字符集和排序规则
      try {
        await sequelize.query(
          `ALTER TABLE cta CONVERT TO CHARACTER SET ${charset} COLLATE ${collate}`,
          { type: sequelize.QueryTypes.RAW }
        );
        results.push({ 
          status: 'success', 
          message: `✅ 已更新表字符集为 ${charset} 和排序规则为 ${collate}` 
        });
      } catch (alterError) {
        results.push({ 
          status: 'error', 
          message: `❌ 更新表字符集失败: ${alterError.message}` 
        });
      }
    } else {
      results.push({ status: 'warning', message: '⚠️ CTA表不存在，将创建新表' });
      
      // 手动创建表，指定字符集和排序规则
      try {
        await sequelize.query(
          `CREATE TABLE IF NOT EXISTS cta (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(100) NOT NULL,
            description VARCHAR(500),
            buttonText VARCHAR(50) NOT NULL,
            link VARCHAR(255) NOT NULL DEFAULT '/contact',
            type VARCHAR(20) NOT NULL DEFAULT 'primary',
            isActive BOOLEAN DEFAULT false,
            \`order\` INTEGER DEFAULT 0,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          ) CHARACTER SET ${charset} COLLATE ${collate}`,
          { type: sequelize.QueryTypes.RAW }
        );
        results.push({ 
          status: 'success', 
          message: `✅ 已创建CTA表，使用字符集 ${charset} 和排序规则 ${collate}` 
        });
      } catch (createError) {
        results.push({ 
          status: 'error', 
          message: `❌ 创建表失败: ${createError.message}` 
        });
        
        return res.status(500).json({ 
          success: false, 
          message: '创建表失败: ' + createError.message,
          logs: results
        });
      }
    }
    
    // 3. 同步表结构
    try {
      await CTA.sync({ alter: true });
      results.push({ status: 'success', message: '✅ CTA表结构已同步' });
    } catch (syncError) {
      results.push({ 
        status: 'error', 
        message: `❌ 同步表结构失败: ${syncError.message}` 
      });
    }
    
    // 4. 检查是否存在数据
    const count = await CTA.count();
    results.push({ status: 'info', message: `ℹ️ 当前CTA表中有 ${count} 条记录` });
    
    // 5. 如果没有数据，创建示例数据
    if (count === 0) {
      results.push({ status: 'warning', message: '⚠️ CTA表为空，创建初始数据...' });
      
      try {
        const defaultCta = await CTA.create({
          title: '准备好开始您的项目了吗？',
          description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
          buttonText: '立即联系',
          link: '/contact',
          isActive: true
        });
        results.push({ status: 'success', message: `✅ 已创建默认CTA记录，ID: ${defaultCta.id}` });
      } catch (createError) {
        results.push({ status: 'error', message: `❌ 创建示例记录失败: ${createError.message}` });
      }
    }
    
    return res.json({ 
      success: true, 
      message: `CTA表初始化成功，当前有 ${count} 条记录`,
      logs: results
    });
  } catch (error) {
    console.error('初始化CTA表失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '初始化失败: ' + error.message,
      logs: [{ status: 'error', message: `❌ 初始化失败: ${error.message}` }]
    });
  }
});

export default router;