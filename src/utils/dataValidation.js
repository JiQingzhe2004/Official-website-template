/**
 * 确保值是有效的数字，如果不是则返回默认值
 * @param {*} value - 要验证的值
 * @param {number} defaultValue - 值无效时的默认值
 * @returns {number} - 处理后的数值
 */
export const ensureNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  try {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? defaultValue : parsedValue;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * 安全地访问对象的属性，如果属性不存在或路径无效则返回默认值
 * @param {Object} obj - 要访问的对象
 * @param {string} path - 属性路径 (例如 "user.profile.name")
 * @param {*} defaultValue - 属性不存在时的默认值
 * @returns {*} - 属性值或默认值
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || !Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
};
