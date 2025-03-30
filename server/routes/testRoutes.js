import express from 'express';

const router = express.Router();

// 基础测试路由 - 用于验证路由系统是否正常工作
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '测试路由工作正常',
    timestamp: new Date().toISOString()
  });
});

// 路由参数测试 - 验证路由参数是否正确传递
router.get('/:param', (req, res) => {
  res.json({
    success: true,
    message: '参数路由测试',
    param: req.params.param,
    query: req.query
  });
});

export default router;
