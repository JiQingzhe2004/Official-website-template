import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取所有菜单项
router.get('/', async (req, res) => {
  try {
    const position = req.query.position; // 可选参数，筛选顶部或底部菜单
    const where = {};
    
    if (position) {
      where.position = position;
    }
    
    // 只获取状态为启用的菜单项
    where.status = true;
    
    const menuItems = await MenuItem.findAll({
      where,
      order: [['order', 'ASC']],
      include: [
        {
          model: MenuItem,
          as: 'children',
          where: { status: true },
          required: false,
          order: [['order', 'ASC']]
        }
      ]
    });
    
    // 只返回顶级菜单项（没有父级的菜单项）
    const topLevelItems = menuItems.filter(item => !item.parent_id);
    
    res.json(topLevelItems);
  } catch (error) {
    console.error('获取菜单项失败:', error);
    res.status(500).json({ message: '获取菜单项失败', error: error.message });
  }
});

// 获取所有菜单项（包括禁用的，用于管理界面）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      order: [['position', 'ASC'], ['order', 'ASC']],
      include: [
        {
          model: MenuItem,
          as: 'parent',
          required: false
        }
      ]
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('获取所有菜单项失败:', error);
    res.status(500).json({ message: '获取所有菜单项失败', error: error.message });
  }
});

// 获取单个菜单项
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id, {
      include: [
        {
          model: MenuItem,
          as: 'children',
          required: false,
          order: [['order', 'ASC']]
        },
        {
          model: MenuItem,
          as: 'parent',
          required: false
        }
      ]
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: '菜单项不存在' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('获取菜单项失败:', error);
    res.status(500).json({ message: '获取菜单项失败', error: error.message });
  }
});

// 创建菜单项（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, path, icon, parent_id, position, order, is_external, status } = req.body;
    
    if (!title || !path) {
      return res.status(400).json({ message: '标题和路径是必需的' });
    }
    
    const menuItem = await MenuItem.create({
      title,
      path,
      icon,
      parent_id,
      position: position || 'top',
      order: order || 0,
      is_external: is_external || false,
      status: status === undefined ? true : status
    });
    
    res.status(201).json({
      message: '菜单项创建成功',
      menuItem
    });
  } catch (error) {
    console.error('创建菜单项失败:', error);
    res.status(500).json({ message: '创建菜单项失败', error: error.message });
  }
});

// 更新菜单项（需要认证）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, path, icon, parent_id, position, order, is_external, status } = req.body;
    
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ message: '菜单项不存在' });
    }
    
    // 防止创建循环引用
    if (parent_id && parent_id == id) {
      return res.status(400).json({ message: '菜单项不能将自己设为父级' });
    }
    
    // 更新菜单项
    await menuItem.update({
      title: title || menuItem.title,
      path: path || menuItem.path,
      icon: icon !== undefined ? icon : menuItem.icon,
      parent_id: parent_id !== undefined ? parent_id : menuItem.parent_id,
      position: position || menuItem.position,
      order: order !== undefined ? order : menuItem.order,
      is_external: is_external !== undefined ? is_external : menuItem.is_external,
      status: status !== undefined ? status : menuItem.status
    });
    
    res.json({
      message: '菜单项更新成功',
      menuItem
    });
  } catch (error) {
    console.error('更新菜单项失败:', error);
    res.status(500).json({ message: '更新菜单项失败', error: error.message });
  }
});

// 删除菜单项（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    
    // 检查是否有子菜单项
    const childrenCount = await MenuItem.count({ where: { parent_id: id } });
    if (childrenCount > 0) {
      return res.status(400).json({ message: '请先删除所有子菜单项' });
    }
    
    const deleted = await MenuItem.destroy({ where: { id } });
    
    if (deleted) {
      res.json({ message: '菜单项删除成功' });
    } else {
      res.status(404).json({ message: '菜单项不存在' });
    }
  } catch (error) {
    console.error('删除菜单项失败:', error);
    res.status(500).json({ message: '删除菜单项失败', error: error.message });
  }
});

export default router;