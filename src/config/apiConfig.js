/**
 * API配置文件
 * 集中管理所有API相关配置
 */

// API基础URL
export const API_BASE_URL = 'https://gwapi.aiqji.cn/api';

// 其他API相关配置
export const API_TIMEOUT = 10000; // 10秒超时
export const API_VERSION = 'v1';

// 导出默认配置对象
const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  version: API_VERSION,
  
  // 工具方法：获取完整API URL
  getApiUrl: (endpoint) => {
    // 确保endpoint不以斜杠开头(避免双斜杠)
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    return `${API_BASE_URL}/${endpoint}`;
  }
};

export default apiConfig;
