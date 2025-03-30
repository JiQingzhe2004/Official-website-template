import express from 'express';
import WhyUs from '../models/WhyUs.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @desc    获取所有'为什么选择我们'数据
// @route   GET /api/whyus
// @access  Public
router.get('/', async (req, res) => {
  try {
    const whyUsItems = await WhyUs.findAll({ where: { isActive: true }, order: [['order', 'ASC']] });
    res.status(200).json({
      success: true,
      count: whyUsItems.length,
      data: whyUsItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取所有'为什么选择我们'数据(包括非活跃)
// @route   GET /api/whyus/all
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const whyUsItems = await WhyUs.findAll({ order: [['order', 'ASC']] });
    res.status(200).json({
      success: true,
      count: whyUsItems.length,
      data: whyUsItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    获取单个'为什么选择我们'数据
// @route   GET /api/whyus/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const whyUsItem = await WhyUs.findByPk(req.params.id);
    if (!whyUsItem) {
      return res.status(404).json({ success: false, message: '未找到数据' });
    }
    res.status(200).json({
      success: true,
      data: whyUsItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// @desc    创建'为什么选择我们'数据
// @route   POST /api/whyus
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const whyUsItem = await WhyUs.create(req.body);
    res.status(201).json({
      success: true,
      data: whyUsItem
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

// @desc    更新'为什么选择我们'数据
// @route   PUT /api/whyus/:id
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let whyUsItem = await WhyUs.findByPk(req.params.id);
    if (!whyUsItem) {
      return res.status(404).json({ success: false, message: '未找到数据' });
    }
    
    whyUsItem = await whyUsItem.update(req.body);
    
    res.status(200).json({
      success: true,
      data: whyUsItem
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

// @desc    删除'为什么选择我们'数据
// @route   DELETE /api/whyus/:id
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const whyUsItem = await WhyUs.findByPk(req.params.id);
    if (!whyUsItem) {
      return res.status(404).json({ success: false, message: '未找到数据' });
    }
    
    await whyUsItem.destroy();
    
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