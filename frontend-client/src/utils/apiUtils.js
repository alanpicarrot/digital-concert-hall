/**
 * API 路徑工具函數
 * 用於確保所有 API 請求路徑都正確
 */
import AuthService from '../services/authService';

// 對每個請求添加監控
const logApiRequest = (method, url, data = null) => {
  console.log(`API 請求: ${method.toUpperCase()} ${url}`);
  if (data) {
    console.log('請求數據:', data);
  }
  
  // 檢查授權狀態
  const token = localStorage.getItem('token');
  console.log('請求時令牌狀態:', token ? '存在' : '無效');
  
  return { url, data };
};

/**
 * 驗證 API 路徑是否正確
 * @param {string} path API 請求路徑
 * @returns {string} 正確的 API 路徑
 */
export const validateApiPath = (path) => {
  if (!path) {
    console.error('API 路徑為空');
    return '/api';
  }
  
  // 產生詳細日誌用於追蹤 API 路徑
  console.log(`原始 API 路徑: ${path}`);
  
  // 處理路徑前綴 - 簡化邏輯，避免多重轉換
  
  // 1. 如果已經有 /api 前綴，直接返回
  if (path.startsWith('/api/')) {
    console.log(`路徑已有 /api 前綴，直接使用: ${path}`);
    return path;
  }
  
  // 2. 處理 auth 相關路徑
  if (path.includes('/auth/') || path.startsWith('auth/') || 
      path === '/signin' || path === '/login') {
    
    // 特殊處理登入路徑
    if (path === '/signin' || path === '/login') {
      console.log('將登入路徑統一轉換為 /api/auth/signin');
      return '/api/auth/signin';
    }
    
    // 標準化 auth 路徑
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!cleanPath.startsWith('/auth/')) {
      // 確保有 /auth/ 前綴
      const authPath = cleanPath.replace('auth/', '/auth/');
      const apiAuthPath = `/api${authPath}`;
      console.log(`標準化認證路徑: ${path} -> ${apiAuthPath}`);
      return apiAuthPath;
    } else {
      // 已有 /auth/ 前綴，只需添加 /api
      const apiAuthPath = `/api${cleanPath}`;
      console.log(`標準化認證路徑: ${path} -> ${apiAuthPath}`);
      return apiAuthPath;
    }
  }
  
  // 3. 所有其他路徑，確保有 /api 前綴
  const normalizedPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  console.log(`標準化 API 路徑: ${path} -> ${normalizedPath}`);
  return normalizedPath;
};

/**
 * 生成完整 API URL
 * @param {string} path API 相對路徑
 * @param {string} baseUrl 基礎 URL，默認為環境變量中的值
 * @returns {string} 完整的 API URL
 */
export const getApiUrl = (path, baseUrl = process.env.REACT_APP_API_URL) => {
  const validPath = validateApiPath(path);
  
  // 記錄每個API URL的構建
  console.log(`構建API URL: ${baseUrl}${validPath}`);
  
  return `${baseUrl}${validPath}`;
};

// 用於檢查當前使用者是否已認證的輔助函數
export const checkAuthentication = () => {
  const user = AuthService.getCurrentUser();
  const isAuthenticated = user && user.accessToken;
  console.log('認證檢查:', { isAuthenticated, username: user?.username });
  return { isAuthenticated, user };
};

export default {
  validateApiPath,
  getApiUrl,
  logApiRequest,
  checkAuthentication
};