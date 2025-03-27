import axios from 'axios';

// 建立 axios 實例
const axiosInstance = axios.create({
  baseURL: '', // 使用空字符串來允許從 package.json 中的 proxy 配置生效
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
    axiosInstance.post('/api/auth/logout').catch(err => {
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
  return axiosInstance.post('/api/auth/register', requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 登入函數
const login = async (username, password) => {
  console.log('Sending login request to /api/auth/login with:', { username, password: '[REDACTED]' });
  
  const response = await axiosInstance.post('/api/auth/login', {
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
  return axiosInstance.post('/api/auth/forgot-password', { email });
};

// 重設密碼
const resetPassword = (token, password) => {
  return axiosInstance.post('/api/auth/reset-password', { token, password });
};

// 更新用戶信息
const updateProfile = (userData) => {
  return axiosInstance.put('/api/users/me', userData);
};

// 更新密碼
const updatePassword = (currentPassword, newPassword) => {
  return axiosInstance.put('/api/users/me/password', {
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