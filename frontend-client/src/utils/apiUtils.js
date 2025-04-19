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
  
  // ---------- 路徑前綴處理 ----------
  // 檢查是否已經有 /api 前綴，避免重複添加
  if (path.startsWith('/api/')) {
    console.log(`路徑已有 /api 前綴，直接使用: ${path}`);
    return path; // 已有前綴，直接返回
  }
  
  // 處理沒有開頭斜線的 api 路徑
  if (path.startsWith('api/')) {
    const correctedPath = '/' + path;
    console.log(`修正 api 路徑格式: ${path} -> ${correctedPath}`);
    return correctedPath;
  }
  
  // ---------- 票券路徑特殊處理 ----------
  // 票券路徑特殊處理，確保 concerts, tickets, performances 路徑的一致性
  const ticketsPatterns = ['/tickets/', '/concerts/', '/performances/'];
  for (const pattern of ticketsPatterns) {
    if (path.includes(pattern)) {
      const ticketsPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
      console.log(`標準化票券API路徑: ${path} -> ${ticketsPath}`);
      return ticketsPath;
    }
  }
  
  // ---------- 認證路徑處理 ----------
  // 處理認證相關路徑
  if (path.startsWith('/signin') || path.startsWith('/register') || 
      path.startsWith('/logout') || path.startsWith('/forgot-password') || 
      path.startsWith('/reset-password')) {
    
    // 特殊處理登入路徑
    if (path === '/signin') {
      console.log('將 /signin 轉換為 /api/auth/signin');
      return '/api/auth/signin';
    }
    
    // 兼容 auth/signin 的格式
    if (path === 'auth/signin' || path === '/auth/signin') {
      console.log('檢測到 auth/signin 格式路徑，轉換為 /api/auth/signin');
      return '/api/auth/signin';
    }
    
    // 其他認證路徑處理
    const authPath = `/api/auth${path}`;
    console.log(`將認證路徑格式化: ${path} -> ${authPath}`);
    return authPath;
  }
  
  // 處理已有 auth 但沒有 api 前綴的路徑
  if (path.includes('/auth/') || path.startsWith('auth/')) {
    const authPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`;
    console.log(`格式化 auth 路徑: ${path} -> ${authPath}`);
    return authPath;
  }
  
  // ---------- 標準路徑處理 ----------
  // 添加 /api 前綴到所有其他路徑
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