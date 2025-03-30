import express from 'express';
import Service from '../models/Service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @desc    获取所有服务
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取所有服务(包括非活跃)
// @route   GET /api/services/all
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取单个服务
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: '未找到服务' });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    创建服务
// @route   POST /api/services
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    更新服务
// @route   PUT /api/services/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: '未找到服务' });
    }
    
    await service.update(req.body);
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    删除服务
// @route   DELETE /api/services/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: '未找到服务' });
    }
    
    await service.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;