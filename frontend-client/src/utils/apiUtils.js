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
  
  // 前端請求統一使用 /api 前綴
  // 先檢查是否已經有 /api 前綴
  if (path.startsWith('/api/')) {
    // 保留 /auth 路徑
    console.log(`路徑已有 /api 前綴: ${path}`);
    return path; // 已有 /api 前綴
  }
  
  // 無 /api 前綴的請求
  // 檢查是否為認證相關路徑
  if (path.startsWith('/signin') || path.startsWith('/register') || 
      path.startsWith('/logout') || path.startsWith('/forgot-password') || 
      path.startsWith('/reset-password')) {
    console.log(`將認證路徑 "${path}" 轉換為 /api/auth 路徑`);
    return `/api/auth${path}`;
  }
  
  // 其他保留 auth 路徑
  if (path.includes('/auth/')) {
    console.log(`保留 auth 路徑: ${path}`);
    path = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
    return path;
  }
  
  // 添加 /api 前綴
  console.log(`將路徑 "${path}" 轉換為正確的 API 路徑`);
  return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
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