import express from 'express';
import Page from '../models/Page.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取所有页面（可筛选状态）
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const pages = await Page.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    
    res.json(pages);
  } catch (error) {
    console.error('获取页面失败:', error);
    res.status(500).json({ message: '获取页面失败', error: error.message });
  }
});

// 获取单个页面（通过ID）
router.get('/:id', async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('获取页面失败:', error);
    res.status(500).json({ message: '获取页面失败', error: error.message });
  }
});

// 获取单个页面（通过slug）
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: req.params.slug } });
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('获取页面失败:', error);
    res.status(500).json({ message: '获取页面失败', error: error.message });
  }
});

// 创建页面（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, slug, content, meta_title, meta_description, status, template, order } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ message: '标题和路径是必需的' });
    }
    
    // 检查slug是否已存在
    const existingPage = await Page.findOne({ where: { slug } });
    if (existingPage) {
      return res.status(400).json({ message: '该路径已被使用' });
    }
    
    const page = await Page.create({
      title,
      slug,
      content,
      meta_title,
      meta_description,
      status: status || 'draft',
      template: template || 'default',
      order: order || 0,
      is_system: false
    });
    
    res.status(201).json({
      message: '页面创建成功',
      page
    });
  } catch (error) {
    console.error('创建页面失败:', error);
    res.status(500).json({ message: '创建页面失败', error: error.message });
  }
});

// 更新页面（需要认证）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, slug, content, meta_title, meta_description, status, template, order } = req.body;
    
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 如果是系统页面，不允许修改slug
    if (page.is_system && page.slug !== slug) {
      return res.status(400).json({ message: '系统页面不允许修改路径' });
    }
    
    // 如果修改了slug，检查是否已存在
    if (slug !== page.slug) {
      const existingPage = await Page.findOne({ where: { slug } });
      if (existingPage) {
        return res.status(400).json({ message: '该路径已被使用' });
      }
    }
    
    // 更新页面
    await page.update({
      title: title || page.title,
      slug: slug || page.slug,
      content: content !== undefined ? content : page.content,
      meta_title: meta_title !== undefined ? meta_title : page.meta_title,
      meta_description: meta_description !== undefined ? meta_description : page.meta_description,
      status: status || page.status,
      template: template || page.template,
      order: order !== undefined ? order : page.order
    });
    
    res.json({
      message: '页面更新成功',
      page
    });
  } catch (error) {
    console.error('更新页面失败:', error);
    res.status(500).json({ message: '更新页面失败', error: error.message });
  }
});

// 删除页面（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 系统页面不允许删除
    if (page.is_system) {
      return res.status(400).json({ message: '系统页面不允许删除' });
    }
    
    await page.destroy();
    
    res.json({ message: '页面删除成功' });
  } catch (error) {
    console.error('删除页面失败:', error);
    res.status(500).json({ message: '删除页面失败', error: error.message });
  }
});

export default router;