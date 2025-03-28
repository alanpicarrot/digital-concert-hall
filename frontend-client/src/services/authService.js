import axios from 'axios';

// 建立 axios 實例
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// 打印環境變量幫助排查問題
console.log('Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_URL: API_URL
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器，為每個請求添加JWT令牌
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  console.log('執行登出操作');
  
  // 先清除本地存儲，確保即使 API 調用失敗也能登出
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 嘗試調用後端登出 API
  try {
    // 檢查是否需要添加 /api 前綴
    const endpoint = API_URL.includes('/api') ? '/auth/logout' : '/api/auth/logout';
    axiosInstance.post(endpoint).catch(err => {
      console.log('登出 API 調用失敗，但本地存儲已清除', err);
      // 已經先清除了本地存儲，所以不需要額外處理
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
      console.log('偵測到 401 未授權錯誤，清除登入狀態');
      
      // 如果收到401錯誤且不是在登入或註冊頁面，則登出用戶
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/reset-password')
      ) {
        logout();
        
        // 顯示通知（可選）
        alert('您的登入已過期，請重新登入');
        
        // 重定向到登入頁面
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 註冊函數
const register = async (username, email, password, firstName, lastName) => {
  // 創建要發送的數據
  const requestData = {
    username: username || '',
    email: email || '',
    password: password || '',
    firstName: firstName || '',
    lastName: lastName || '',
    role: ['user']
  };
  
  // 輸出完整的請求數據（密碼除外）
  console.log('Sending register request with data:', {
    ...requestData,
    password: '[REDACTED]',
  });
  
  // 確保 Content-Type 正確設置
  // 檢查是否需要添加 /api 前綴
  const endpoint = API_URL.includes('/api') ? '/auth/register' : '/api/auth/register';
  return axiosInstance.post(endpoint, requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 登入函數
const login = async (username, password) => {
  console.log('Sending login request with:', { username, password: '[REDACTED]' });
  
  // 檢查是否需要添加 /api 前綴
  const endpoint = API_URL.includes('/api') ? '/auth/login' : '/api/auth/login';
  console.log('Login endpoint:', endpoint);
  
  const response = await axiosInstance.post(endpoint, {
    username,
    password,
  });
  
  // 後端返回的是 accessToken 而不是 token
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// 獲取當前用戶信息
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// 重設密碼請求
const forgotPassword = (email) => {
  const endpoint = API_URL.includes('/api') ? '/auth/forgot-password' : '/api/auth/forgot-password';
  return axiosInstance.post(endpoint, { email });
};

// 重設密碼
const resetPassword = (token, password) => {
  const endpoint = API_URL.includes('/api') ? '/auth/reset-password' : '/api/auth/reset-password';
  return axiosInstance.post(endpoint, { token, password });
};

// 更新用戶信息
const updateProfile = (userData) => {
  const endpoint = API_URL.includes('/api') ? '/users/me' : '/api/users/me';
  return axiosInstance.put(endpoint, userData);
};

// 更新密碼
const updatePassword = (currentPassword, newPassword) => {
  const endpoint = API_URL.includes('/api') ? '/users/me/password' : '/api/users/me/password';
  return axiosInstance.put(endpoint, {
    currentPassword,
    newPassword,
  });
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  axiosInstance,
};

export default AuthService;