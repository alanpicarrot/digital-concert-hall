/**
 * API 實用工具
 * 用於處理 API 路徑和請求
 */

/**
 * 驗證 API 路徑格式，確保它以斜杠開頭
 * @param {string} path API 路徑
 * @returns {string} 格式化後的 API 路徑
 */
export const validateApiPath = (path) => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
};

/**
 * 格式化 REST API 響應
 * @param {object} response Axios 響應對象
 * @returns {object} 格式化的響應對象
 */
export const formatResponse = (response) => {
  return {
    success: true,
    status: response.status,
    statusText: response.statusText,
    data: response.data
  };
};

/**
 * 格式化 REST API 錯誤
 * @param {object} error Axios 錯誤對象
 * @returns {object} 格式化的錯誤對象
 */
export const formatError = (error) => {
  return {
    success: false,
    status: error.response ? error.response.status : null,
    statusText: error.response ? error.response.statusText : null,
    message: error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message,
    data: error.response ? error.response.data : null
  };
};
