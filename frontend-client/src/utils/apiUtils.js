/**
 * API 路徑工具函數
 * 用於確保所有 API 請求路徑都正確
 */

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
  
  // 如果後端控制器已經包含 /api 前綴，我們不需要再添加
  if (path.startsWith('/api/')) {
    return path; // 已經是正確的路徑
  }
  
  // 如果尚未包含 /api 前綴，添加它
  console.warn(`警告: API 路徑 "${path}" 應該以 "/api/" 開頭`);
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
  return `${baseUrl}${validPath}`;
};

export default {
  validateApiPath,
  getApiUrl
};