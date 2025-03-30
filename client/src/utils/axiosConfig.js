import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gwapi.aiqji.cn/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 记录令牌刷新状态，避免多次刷新请求
let isRefreshing = false;
// 等待令牌刷新的请求队列
let refreshSubscribers = [];

// 执行请求队列中的等待请求
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 添加请求到等待队列
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// 添加请求调试信息
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 发送${config.method.toUpperCase()}请求: ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 调试响应
api.interceptors.response.use(
  (response) => {
    console.log(`✅ 收到响应: ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`❌ 响应错误: ${error.config?.url}`, {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ 未收到响应:', error.request);
    } else {
      console.error('❌ 请求设置错误:', error.message);
    }
    
    const originalRequest = error.config;
    
    // 确保原始请求存在并且是401错误
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      // 防止重复尝试刷新令牌
      if (isRefreshing) {
        // 如果已经在刷新令牌，则将请求加入队列
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            // 替换旧令牌
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // 尝试刷新令牌
        const oldToken = localStorage.getItem('token');
        if (!oldToken) {
          // 如果没有令牌，则重定向到登录页
          window.location.href = '/login';
          throw new Error('未找到令牌');
        }
        
        console.log('尝试刷新令牌...');
        const refreshRes = await axios.post('https://gwapi.aiqji.cn/api/auth/refresh', {
          token: oldToken
        });
        
        if (refreshRes.data.success && refreshRes.data.token) {
          // 保存新令牌
          const newToken = refreshRes.data.token;
          console.log('成功获取新令牌');
          localStorage.setItem('token', newToken);
          
          // 更新请求头并重试原始请求
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // 处理队列中的请求
          onRefreshed(newToken);
          isRefreshing = false;
          
          return axios(originalRequest);
        } else {
          console.error('刷新令牌响应无效:', refreshRes.data);
          throw new Error('刷新令牌失败');
        }
      } catch (refreshError) {
        console.error('刷新令牌出错:', refreshError);
        // 刷新失败，清除令牌并重定向到登录页
        localStorage.removeItem('token');
        isRefreshing = false;
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 令牌检查方法 - 在应用启动时调用
export const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  try {
    // 尝试验证令牌
    console.log('验证令牌有效性...');
    await api.get('/auth/verify');
    console.log('令牌有效');
    return true;
  } catch (error) {
    console.log('令牌无效或过期，尝试刷新...');
    try {
      const refreshRes = await axios.post('https://gwapi.aiqji.cn/api/auth/refresh', {
        token
      });
      
      if (refreshRes.data.success && refreshRes.data.token) {
        const newToken = refreshRes.data.token;
        localStorage.setItem('token', newToken);
        console.log('成功刷新令牌');
        return true;
      }
    } catch (refreshError) {
      console.error('令牌刷新失败:', refreshError);
      localStorage.removeItem('token');
      return false;
    }
  }
};

// 添加CORS测试功能
export const testCorsSetup = async () => {
  try {
    const response = await axios.get('https://gwapi.aiqji.cn/api/cors-test', {
      withCredentials: true
    });
    console.log('CORS测试成功:', response.data);
    return true;
  } catch (error) {
    console.error('CORS测试失败:', error);
    return false;
  }
};

export default api;
