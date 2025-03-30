import express from 'express';
import Stat from '../models/Stat.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @desc    获取所有统计数据
// @route   GET /api/stats
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stats = await Stat.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取所有统计数据(包括非活跃)
// @route   GET /api/stats/all
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const stats = await Stat.findAll({
      order: [['order', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取单个统计数据
// @route   GET /api/stats/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const stat = await Stat.findByPk(req.params.id);
    if (!stat) {
      return res.status(404).json({ success: false, message: '未找到统计数据' });
    }
    res.status(200).json({
      success: true,
      data: stat
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    创建统计数据
// @route   POST /api/stats
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const stat = await Stat.create(req.body);
    res.status(201).json({
      success: true,
      data: stat
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

// @desc    更新统计数据
// @route   PUT /api/stats/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let stat = await Stat.findByPk(req.params.id);
    if (!stat) {
      return res.status(404).json({ success: false, message: '未找到统计数据' });
    }
    
    await stat.update(req.body);
    
    // 获取更新后的数据
    stat = await Stat.findByPk(req.params.id);
    
    res.status(200).json({
      success: true,
      data: stat
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    删除统计数据
// @route   DELETE /api/stats/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const stat = await Stat.findByPk(req.params.id);
    if (!stat) {
      return res.status(404).json({ success: false, message: '未找到统计数据' });
    }
    
    await stat.destroy();
    
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