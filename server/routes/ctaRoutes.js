import express from 'express';
import CTA from '../models/CTA.js';
import { validateCTA } from '../validators/ctaValidator.js';
import { sequelize } from '../config/db.js';

const router = express.Router();

// 获取所有CTA
router.get('/cta', async (req, res) => {
  try {
    const ctas = await CTA.findAll({
      order: [['order', 'ASC']]
    });
    res.json(ctas);
  } catch (error) {
    console.error('获取CTA列表出错:', error);
    res.status(500).json({ message: '获取CTA列表失败', error: error.message });
  }
});

// 获取单个CTA
router.get('/cta/:id', async (req, res) => {
  try {
    const cta = await CTA.findByPk(req.params.id);
    
    if (!cta) {
      return res.status(404).json({ message: '找不到指定的CTA' });
    }
    
    res.json(cta);
  } catch (error) {
    console.error('获取CTA详情出错:', error);
    res.status(500).json({ message: '获取CTA详情失败', error: error.message });
  }
});

// 创建新CTA
router.post('/cta', async (req, res) => {
  // 添加事务处理
  const transaction = await sequelize.transaction();
  
  try {
    // 记录请求数据
    console.log('收到CTA创建请求，数据:', JSON.stringify(req.body, null, 2));
    
    // 数据验证
    const validationResult = validateCTA(req.body);
    if (!validationResult.isValid) {
      console.log('CTA数据验证失败:', validationResult.errors);
      await transaction.rollback();
      return res.status(400).json({ message: validationResult.errors.join(', ') });
    }
    
    // 准备数据，确保所有字段都有值
    const ctaData = {
      title: req.body.title,
      description: req.body.description || '',
      buttonText: req.body.buttonText,
      link: req.body.link,
      type: req.body.type || 'primary',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      order: req.body.order !== undefined ? parseInt(req.body.order, 10) : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('准备创建CTA，处理后数据:', JSON.stringify(ctaData, null, 2));
    
    // 尝试创建记录，使用原始SQL查询作为备选方案
    try {
      // 方法1: 使用Sequelize模型
      const newCTA = await CTA.create(ctaData, { transaction });
      console.log('CTA创建成功，ID:', newCTA.id);
      
      await transaction.commit();
      return res.status(201).json(newCTA);
    } catch (modelError) {
      console.error('使用Sequelize模型创建CTA失败，尝试使用原始SQL:', modelError);
      
      // 方法2: 使用原始SQL
      try {
        const fields = Object.keys(ctaData).join(', ');
        const placeholders = Object.keys(ctaData).map(() => '?').join(', ');
        const values = Object.values(ctaData);
        
        const [result] = await sequelize.query(
          `INSERT INTO cta (${fields}) VALUES (${placeholders})`,
          { 
            replacements: values,
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
        
        const insertId = result;
        console.log('使用原始SQL创建CTA成功，ID:', insertId);
        
        const [newCTA] = await sequelize.query(
          'SELECT * FROM cta WHERE id = ?',
          {
            replacements: [insertId],
            type: sequelize.QueryTypes.SELECT,
            transaction
          }
        );
        
        await transaction.commit();
        return res.status(201).json(newCTA);
      } catch (sqlError) {
        console.error('使用原始SQL创建CTA也失败:', sqlError);
        throw sqlError; // 继续传递错误
      }
    }
  } catch (error) {
    console.error('创建CTA出错，完整错误信息:', error);
    await transaction.rollback();
    
    // 错误分类处理
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: '数据验证失败', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({ 
        message: '数据库操作错误', 
        error: error.message,
        originalError: error.original ? error.original.message : '未知',
        sql: error.sql // 记录导致错误的SQL语句
      });
    }
    
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        message: '数据库连接错误', 
        error: error.message 
      });
    }
    
    // 默认错误处理
    res.status(500).json({ 
      message: '创建CTA失败', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 更新CTA
router.put('/cta/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const cta = await CTA.findByPk(req.params.id, { transaction });
    
    if (!cta) {
      await transaction.rollback();
      return res.status(404).json({ message: '找不到指定的CTA' });
    }
    
    // 数据验证
    const validationResult = validateCTA(req.body);
    if (!validationResult.isValid) {
      await transaction.rollback();
      return res.status(400).json({ message: validationResult.errors.join(', ') });
    }
    
    // 准备更新数据
    const updateData = {
      title: req.body.title || cta.title,
      description: req.body.description !== undefined ? req.body.description : cta.description,
      buttonText: req.body.buttonText || cta.buttonText,
      link: req.body.link || cta.link,
      type: req.body.type || cta.type,
      isActive: req.body.isActive !== undefined ? req.body.isActive : cta.isActive,
      order: req.body.order !== undefined ? parseInt(req.body.order, 10) : cta.order,
      updatedAt: new Date()
    };
    
    // 执行更新
    await cta.update(updateData, { transaction });
    
    await transaction.commit();
    res.json(cta);
  } catch (error) {
    console.error('更新CTA出错:', error);
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ 
        message: '数据验证失败', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: '更新CTA失败', error: error.message });
  }
});

// 删除CTA
router.delete('/cta/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const cta = await CTA.findByPk(req.params.id, { transaction });
    
    if (!cta) {
      await transaction.rollback();
      return res.status(404).json({ message: '找不到指定的CTA' });
    }
    
    await cta.destroy({ transaction });
    
    await transaction.commit();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除CTA出错:', error);
    await transaction.rollback();
    res.status(500).json({ message: '删除CTA失败', error: error.message });
  }
});

// 健康检查端点
router.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    // 检查cta表是否存在
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'cta'
    `);
    
    const ctaTableExists = tables.length > 0;
    
    if (!ctaTableExists) {
      return res.status(200).json({
        status: 'warning',
        message: 'CTA表不存在，需要同步模型',
        details: {
          database: 'connected',
          ctaTable: 'missing'
        }
      });
    }
    
    res.status(200).json({
      status: 'ok',
      message: '服务正常运行',
      details: {
        database: 'connected',
        ctaTable: 'exists'
      }
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(503).json({
      status: 'error',
      message: '服务异常',
      error: error.message
    });
  }
});

export default router;
