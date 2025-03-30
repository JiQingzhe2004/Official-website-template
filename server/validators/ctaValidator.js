/**
 * CTA数据验证函数
 * @param {Object} data - CTA数据对象
 * @returns {Object} 验证结果
 */
export const validateCTA = (data) => {
  const errors = [];
  
  // 标题验证
  if (!data.title) {
    errors.push('标题不能为空');
  } else if (data.title.length > 100) {
    errors.push('标题不能超过100个字符');
  }
  
  // 描述验证 (可选字段)
  if (data.description && data.description.length > 500) {
    errors.push('描述不能超过500个字符');
  }
  
  // 按钮文本验证
  if (!data.buttonText) {
    errors.push('按钮文本不能为空');
  } else if (data.buttonText.length > 50) {
    errors.push('按钮文本不能超过50个字符');
  }
  
  // 链接验证
  if (!data.link) {
    errors.push('链接不能为空');
  } else {
    // 简单的URL格式验证
    try {
      new URL(data.link.startsWith('http') ? data.link : `http://${data.link}`);
    } catch (e) {
      errors.push('链接格式不正确');
    }
  }
  
  // 类型验证
  if (data.type && !['primary', 'secondary', 'tertiary'].includes(data.type)) {
    errors.push('类型必须是primary、secondary或tertiary');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
