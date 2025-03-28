import axios from 'axios';

// 建立 axios 實例
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
const API_BASE = `${API_URL}/api`; 

// 打印環境變量和 API URL
console.log('Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_URL: API_URL,
  API_BASE: API_BASE
});

// 創建兩個 axios 實例
// 1. 帶 /api 前綴的實例用於大部分請求
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 不帶 /api 前綴的實例用於直接訪問
const axiosRootInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器，為每個請求添加JWT令牌
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 登出函數
const logout = () => {
  console.log('執行管理員登出操作');
  
  // 先清除本地存儲，確保即使 API 調用失敗也能登出
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // 嘗試調用後端登出 API
  try {
    axiosInstance.post('/auth/logout').catch(err => {
      console.log('登出 API 調用失敗，但本地存儲已清除', err);
    });
  } catch (error) {
    console.error('登出 API 調用失敗', error);
  }
};

// 響應攔截器，處理常見錯誤（如401未授權）
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 錯誤:', error.response ? error.response.status : error.message);
    
    // 處理 401 未授權錯誤 (令牌過期或無效)
    if (error.response && error.response.status === 401) {
      console.log('偵測到 401 未授權錯誤，清除管理員登入狀態');
      
      // 如果收到401錯誤且不是在登入頁面或註冊頁面，則登出用戶
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register-admin')) {
        logout();
        
        // 顯示通知
        alert('您的登入已過期，請重新登入');
        
        // 重定向到登入頁面
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// 管理員登入函數
const login = async (usernameOrEmail, password) => {
  console.log('Sending admin login request with:', { usernameOrEmail, password: '[REDACTED]' });
  
  // 檢查是否需要添加 /api 前綴
  const endpoint = '/auth/login';
  
  // 嘗試使用作為用戶名登入
  const response = await axiosInstance.post(endpoint, {
    username: usernameOrEmail, // 將 email/username 作為 username 傳送
    password,
  });
  
  if (response.data && response.data.accessToken) {
    localStorage.setItem('adminToken', response.data.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(response.data));
    return response.data;
  }
  
  return response.data;
};

// 獲取當前管理員信息
const getCurrentAdmin = () => {
  return JSON.parse(localStorage.getItem('adminUser'));
};

const AuthService = {
  login,
  logout,
  getCurrentAdmin,
  axiosInstance,
};

export default AuthService;