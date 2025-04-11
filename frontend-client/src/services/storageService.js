/**
 * 存儲服務 - 用於在 localStorage 和 sessionStorage 中持久化數據
 * 提供統一的存取接口，支持對象序列化和自動過期
 */

// 默認前綴，避免命名衝突
const DEFAULT_PREFIX = 'dch:';

/**
 * 本地存儲服務
 */
const localStorageService = {
  /**
   * 設置 localStorage 項，支持對象和過期時間
   * @param {string} key - 存儲鍵名
   * @param {any} value - 存儲值，可以是任何 JSON 可序列化的值
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   * @param {number} options.expiry - 過期時間（毫秒），如果未提供則永不過期
   */
  set: (key, value, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      const fullKey = `${prefix}${key}`;
      
      // 如果提供了過期時間，添加到存儲對象中
      const storageObj = {
        value,
        ...(options.expiry && { expiry: Date.now() + options.expiry })
      };
      
      localStorage.setItem(fullKey, JSON.stringify(storageObj));
      return true;
    } catch (error) {
      console.error('localStorage 設置失敗:', error);
      return false;
    }
  },
  
  /**
   * 從 localStorage 獲取項
   * @param {string} key - 存儲鍵名
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   * @param {any} options.defaultValue - 如果項不存在或已過期，返回的默認值
   * @returns {any} 存儲的值或默認值
   */
  get: (key, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      const fullKey = `${prefix}${key}`;
      
      const rawItem = localStorage.getItem(fullKey);
      if (!rawItem) return options.defaultValue;
      
      const storageObj = JSON.parse(rawItem);
      
      // 檢查是否過期
      if (storageObj.expiry && storageObj.expiry < Date.now()) {
        localStorage.removeItem(fullKey);
        return options.defaultValue;
      }
      
      return storageObj.value;
    } catch (error) {
      console.error('localStorage 獲取失敗:', error);
      return options.defaultValue;
    }
  },
  
  /**
   * 從 localStorage 移除項
   * @param {string} key - 存儲鍵名
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   */
  remove: (key, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      localStorage.removeItem(`${prefix}${key}`);
      return true;
    } catch (error) {
      console.error('localStorage 移除失敗:', error);
      return false;
    }
  },
  
  /**
   * 清除所有屬於應用的 localStorage 項
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   */
  clear: (options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      
      // 僅清除帶有應用前綴的項
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('localStorage 清除失敗:', error);
      return false;
    }
  }
};

/**
 * 會話存儲服務（使用 sessionStorage）
 */
const sessionStorageService = {
  /**
   * 設置 sessionStorage 項
   * @param {string} key - 存儲鍵名
   * @param {any} value - 存儲值
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   */
  set: (key, value, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      const fullKey = `${prefix}${key}`;
      
      sessionStorage.setItem(fullKey, JSON.stringify({ value }));
      return true;
    } catch (error) {
      console.error('sessionStorage 設置失敗:', error);
      return false;
    }
  },
  
  /**
   * 從 sessionStorage 獲取項
   * @param {string} key - 存儲鍵名
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   * @param {any} options.defaultValue - 默認值
   */
  get: (key, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      const fullKey = `${prefix}${key}`;
      
      const rawItem = sessionStorage.getItem(fullKey);
      if (!rawItem) return options.defaultValue;
      
      const storageObj = JSON.parse(rawItem);
      return storageObj.value;
    } catch (error) {
      console.error('sessionStorage 獲取失敗:', error);
      return options.defaultValue;
    }
  },
  
  /**
   * 從 sessionStorage 移除項
   */
  remove: (key, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      sessionStorage.removeItem(`${prefix}${key}`);
      return true;
    } catch (error) {
      console.error('sessionStorage 移除失敗:', error);
      return false;
    }
  },
  
  /**
   * 清除所有屬於應用的 sessionStorage 項
   */
  clear: (options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('sessionStorage 清除失敗:', error);
      return false;
    }
  }
};

/**
 * 用戶偏好設置存儲
 * 專門用於存儲用戶界面偏好，如主題、語言等
 */
const userPreferences = {
  /**
   * 設置用戶偏好
   * @param {string} key - 偏好名稱
   * @param {any} value - 偏好值
   */
  set: (key, value) => {
    return localStorageService.set(`preferences:${key}`, value);
  },
  
  /**
   * 獲取用戶偏好
   * @param {string} key - 偏好名稱
   * @param {any} defaultValue - 默認值
   */
  get: (key, defaultValue) => {
    return localStorageService.get(`preferences:${key}`, { defaultValue });
  },
  
  /**
   * 移除用戶偏好
   * @param {string} key - 偏好名稱
   */
  remove: (key) => {
    return localStorageService.remove(`preferences:${key}`);
  }
};

/**
 * 購物車存儲
 */
const cartStorage = {
  /**
   * 保存購物車
   * @param {Object} cart - 購物車對象
   */
  saveCart: (cart) => {
    return localStorageService.set('cart', cart);
  },
  
  /**
   * 獲取購物車
   * @returns {Object} 購物車對象 {items: [], total: 0}
   */
  getCart: () => {
    return localStorageService.get('cart', { defaultValue: {items: [], total: 0} });
  },
  
  /**
   * 清空購物車
   */
  clearCart: () => {
    return localStorageService.remove('cart');
  }
};

/**
 * 曾經瀏覽過的音樂會歷史記錄
 */
const browsingHistory = {
  /**
   * 添加一個音樂會到瀏覽歷史
   * @param {Object} concert - 音樂會信息
   */
  addConcert: (concert) => {
    if (!concert || !concert.id) return false;
    
    // 獲取現有歷史
    const history = localStorageService.get('history:concerts', { defaultValue: [] });
    
    // 檢查是否已存在
    const existingIndex = history.findIndex(item => item.id === concert.id);
    if (existingIndex !== -1) {
      // 移除舊記錄
      history.splice(existingIndex, 1);
    }
    
    // 添加到歷史頂部
    history.unshift({
      id: concert.id,
      title: concert.title,
      posterUrl: concert.posterUrl,
      timestamp: Date.now()
    });
    
    // 保留最近的20條記錄
    const trimmedHistory = history.slice(0, 20);
    
    // 保存更新的歷史
    return localStorageService.set('history:concerts', trimmedHistory);
  },
  
  /**
   * 獲取瀏覽歷史
   * @param {number} limit - 要返回的最大記錄數
   */
  getConcerts: (limit = 10) => {
    const history = localStorageService.get('history:concerts', { defaultValue: [] });
    return history.slice(0, limit);
  },
  
  /**
   * 清除瀏覽歷史
   */
  clear: () => {
    return localStorageService.remove('history:concerts');
  }
};

// 導出主要服務
const storageService = {
  local: localStorageService,
  session: sessionStorageService,
  preferences: userPreferences,
  cart: cartStorage,
  history: browsingHistory
};

export default storageService;