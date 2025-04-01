import axios from 'axios';
import { validateApiPath } from '../utils/apiUtils';

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
    console.log('請求攔截器 - 檢測令牌：', token ? '存在' : '不存在');
    
    if (token) {
      // 確保Authorization頭信息正確設置
      config.headers['Authorization'] = 'Bearer ' + token;
      console.log('已添加認證頭信息：', 'Bearer ' + token.substring(0, 10) + '...');
    }
    
    console.log('請求目標：', config.url);
    return config;
  },
  (error) => {
    console.error('請求攔截器錯誤：', error);
    return Promise.reject(error);
  }
);

// 登出函數
const logout = () => {
  console.log('執行登出操作');
  
  // 先清除本地存儲，確保即使 API 調用失敗也能登出
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 清除任何可能的購物車或結帳信息
  sessionStorage.removeItem('checkoutInfo');
  
  // 嘗試調用後端登出 API
  try {
    // 使用一致的路徑
    const endpoint = '/api/auth/logout';
    console.log('API URL:', API_URL);
    console.log('登出請求 URL:', `${API_URL}${endpoint}`);
    
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
      const currentUrl = window.location.href;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/reset-password')
      ) {
        logout();
        
        // 顯示通知（可選）
        alert('您的登入已過期，請重新登入');
        
        // 保存當前頁面路徑用於登入後重定向
        const redirectPath = encodeURIComponent(currentPath);
        
        // 重定向到登入頁面，並帶上當前頁面作為重定向參數
        window.location.href = `/login?redirect=${redirectPath}`;
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
  
  // 使用一致的路徑，不使用 validateApiPath 避免重複添加 /api 前綴
  const endpoint = '/api/auth/register';
  console.log('API URL:', API_URL);
  console.log('完整請求 URL:', `${API_URL}${endpoint}`);
  
  return axiosInstance.post(endpoint, requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 改進的登入函數
const login = async (username, password) => {
  console.log('登入流程啟動 - 清除舊資料');
  // 先清除舊的登入狀態，避免混合
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log('發送登入請求:', { username, password: '******' });
  
  try {
    // 使用 validateApiPath 確保路徑一致
    const endpoint = '/api/auth/login';
    console.log('API URL:', API_URL);
    console.log('完整請求 URL:', `${API_URL}${endpoint}`);
    
    const response = await axiosInstance.post(endpoint, {
      username,
      password
    });
    
    console.log('登入請求成功:', response.status, response.statusText);
    console.log('登入回應資料:', response.data);
    
    // 檢查回應中的 token
    if (response.data && response.data.accessToken) {
      console.log('成功收到令牌，存入 localStorage');
      
      // 存入令牌
      localStorage.setItem('token', response.data.accessToken);
      
      // 確保用戶資料完整
      const userData = {
        ...response.data,
        username: response.data.username || username,
        id: response.data.id,
        email: response.data.email,
        roles: response.data.roles,
        accessToken: response.data.accessToken
      };
      
      console.log('寫入的用戶數據：', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 偵測 localStorage 是否成功存入
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('存入後的檢查:', {
        token: savedToken ? '已設置' : '未設置',
        user: savedUser ? '已設置' : '未設置',
        userData: savedUser ? JSON.parse(savedUser) : null
      });
      
      return userData;
    } else {
      console.error('登入回應中沒有令牌:', response.data);
      throw new Error('登入回應中沒有令牌');
    }
  } catch (error) {
    console.error('登入錯誤:', error.message);
    if (error.response) {
      console.error('錯誤資料:', error.response.data);
      console.error('錯誤狀態:', error.response.status);
    }
    throw error;
  }
};

// 獲取當前用戶信息
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    console.log('localStorage 中的用戶字符串:', userStr);
    if (!userStr) {
      console.log('localStorage 中沒有用戶數據');
      return null;
    }
    
    // 檢查令牌有效性
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('找不到令牌');
      return null;
    }
    
    let user;
    try {
      user = JSON.parse(userStr);
      console.log('解析後的用戶對象:', user);
    } catch (parseError) {
      console.error('解析用戶JSON時出錯:', parseError);
      // 如果解析失敗，創建空對象
      user = {};
    }
    
    // 確保用戶對象完整
    user.accessToken = token;
    
    // 如果用戶名稱不存在，嘗試從 token 正文中提取
    if (!user.username) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT 載荷:', payload);
          
          // 如果載荷中有用戶名稱，使用它
          if (payload.sub) {
            user.username = payload.sub;
            console.log('從 JWT 獲取的用戶名稱:', user.username);
            // 更新儲存資訊
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } catch (jwtError) {
        console.error('解析 JWT 時出錯:', jwtError);
      }
    }
    
    // 還是沒有用戶名稱，創建預設用戶名稱
    if (!user.username) {
      user.username = '已登入用戶';
      console.log('設置預設用戶名稱');
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    console.error('獲取當前用戶時出錯:', error);
    return null;
  }
};

// 檢查令牌是否有效
const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // 檢查令牌格式
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.error('令牌格式不正確');
    return false;
  }
  
  try {
    // 解析JWT的有效期
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 檢查令牌是否過期
    if (payload.exp && payload.exp < currentTime) {
      console.log('令牌已過期', { exp: payload.exp, now: currentTime, diff: currentTime - payload.exp });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('驗證令牌時出錯:', error);
    return false;
  }
};

// 重設密碼請求
const forgotPassword = (email) => {
  const endpoint = '/api/auth/forgot-password';
  console.log('忘記密碼請求 URL:', `${API_URL}${endpoint}`);
  return axiosInstance.post(endpoint, { email });
};

// 重設密碼
const resetPassword = (token, password) => {
  const endpoint = '/api/auth/reset-password';
  console.log('重設密碼請求 URL:', `${API_URL}${endpoint}`);
  return axiosInstance.post(endpoint, { token, password });
};

// 更新用戶信息
const updateProfile = (userData) => {
  const endpoint = '/api/users/me';
  console.log('更新用戶信息請求 URL:', `${API_URL}${endpoint}`);
  return axiosInstance.put(endpoint, userData);
};

// 更新密碼
const updatePassword = (currentPassword, newPassword) => {
  const endpoint = '/api/users/me/password';
  console.log('更新密碼請求 URL:', `${API_URL}${endpoint}`);
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
  isTokenValid,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  axiosInstance,
};

export default AuthService;
