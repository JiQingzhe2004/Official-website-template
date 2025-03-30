/**
 * 配置聚合导出文件
 * 将所有配置集中导出，方便引用
 */

import apiConfig, { API_BASE_URL } from './apiConfig';

// 导出所有配置
export {
  apiConfig as default,
  API_BASE_URL
};

// 也可以导出一个全局常量供组件直接使用
export const API_URL = API_BASE_URL;
