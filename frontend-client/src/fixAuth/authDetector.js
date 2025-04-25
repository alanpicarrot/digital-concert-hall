/**
 * 認證問題偵測與修復器
 * 用於檢測和修復常見的認證相關問題
 */

// 檢測並修復令牌問題
export const detectAndFixAuthIssues = () => {
  console.log('執行認證問題偵測...');

  // 檢查是否有全局的 axiosInstance 或相關實例
  let foundAxiosInstance = false;
  if (window.axiosInstance) {
    foundAxiosInstance = true;
    console.log('發現全局的 axiosInstance');
  }

  if (window.authService && window.authService.axiosInstance) {
    foundAxiosInstance = true;
    console.log('發現 authService.axiosInstance');
  }

  // 檢查本地存儲中的令牌
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  console.log('認證狀態檢查:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    hasUser: !!user,
    username: user?.username || '未知',
    isExpired: token ? isTokenExpired(token) : false
  });

  // 添加全局修復函數，允許手動修復
  window.fixApiAuthProblem = function(forceReload = false) {
    // 手動為特定請求添加令牌
    const origFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      // 如果是訂單相關API且沒有設置授權頭
      if (
        (typeof url === 'string' && (
          url.includes('/api/orders') || 
          url.includes('/api/tickets/purchase') || 
          url.includes('/api/payment') ||
          url.includes('/api/checkout')
        )) && 
        (!options.headers || !options.headers['Authorization'])
      ) {
        const token = localStorage.getItem('token');
        if (token) {
          // 確保 headers 對象存在
          options.headers = options.headers || {};
          
          // 添加授權頭
          options.headers['Authorization'] = 'Bearer ' + token;
          console.log('手動修復: 為請求添加了令牌 -', url);
        }
      }
      return origFetch(url, options);
    };
    
    // 修復 Axios 請求
    if (window.axios) {
      const origRequest = window.axios.request;
      window.axios.request = function(config) {
        if (config.url && (
          config.url.includes('/api/orders') || 
          config.url.includes('/api/tickets/purchase') || 
          config.url.includes('/api/payment') ||
          config.url.includes('/api/checkout')
        ) && (!config.headers || !config.headers['Authorization'])) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = 'Bearer ' + token;
            console.log('手動修復: 為 axios 請求添加了令牌 -', config.url);
          }
        }
        return origRequest(config);
      };
    }
    
    // 修復可能的全局 axiosInstance
    if (window.axiosInstance) {
      patchAxiosInstance(window.axiosInstance);
    }
    
    // 修復 authService 中的 axiosInstance
    if (window.authService && window.authService.axiosInstance) {
      patchAxiosInstance(window.authService.axiosInstance);
    }
    
    console.log('API授權問題修復已應用');
    
    // 禁用自動重定向，但保留函數以便需要時使用
    window.executeLoginRedirect = false;
    
    if (forceReload) {
      window.location.reload();
    }
    
    return '認證修復已應用，請再次嘗試結帳或重新整理頁面';
  };

  // 自動應用修復
  window.fixApiAuthProblem(false);

  return {
    hasToken: !!token,
    tokenValid: token && !isTokenExpired(token),
    hasUser: !!user
  };
};

// 檢查令牌是否已過期
function isTokenExpired(token) {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (!payload.exp) return false;
    
    // 計算過期時間
    const expirationTime = payload.exp;
    const timeToExpire = expirationTime - currentTime;
    
    console.log('令牌過期檢查:', {
      expirationTime: new Date(expirationTime * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      timeToExpire: timeToExpire,
      isExpired: timeToExpire <= 0
    });
    
    return timeToExpire <= 0;
  } catch (e) {
    console.error('檢查令牌過期時出錯:', e);
    return false; // 預設為有效
  }
}

// 修補 axiosInstance 以確保路徑比對正確
function patchAxiosInstance(instance) {
  if (!instance || !instance.interceptors) return;
  
  // 清除所有原有的請求攔截器
  instance.interceptors.request.handlers = [];
  
  // 添加新的攔截器
  instance.interceptors.request.use(config => {
    // 需要授權的路徑模式
    const protectedPathPatterns = [
      '/api/orders',
      '/api/tickets/purchase',
      '/api/users',
      '/api/checkout',
      '/api/payment'
    ];
    
    // 檢查是否是受保護的路徑
    const needsAuth = protectedPathPatterns.some(pattern => 
      config.url && (
        config.url === pattern || 
        config.url.startsWith(pattern + '/') || 
        config.url.startsWith(pattern + '?')
      )
    );
    
    // 如果需要授權，添加令牌
    if (needsAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log(`[修復] 為請求添加令牌: ${config.url}`);
        config.headers = config.headers || {};
        config.headers['Authorization'] = 'Bearer ' + token;
      } else {
        console.warn(`[修復] 需要令牌的路徑但令牌不存在: ${config.url}`);
      }
    }
    
    return config;
  });
  
  console.log('已修復 axiosInstance 的請求攔截器');
}

export default { detectAndFixAuthIssues };
