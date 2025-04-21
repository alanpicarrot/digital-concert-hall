/**
 * ToastManager.js
 * 用于在非 React 組件環境中管理通知的實用工具
 * 這允許我們從服務文件 (如 authService.js) 使用 Toast 通知功能
 */

class ToastManager {
  constructor() {
    this.callbacks = {
      success: null,
      error: null,
      info: null,
      warning: null
    };
    
    // 設置全局實例，以便可以從任何地方訪問
    if (!window.ToastManager) {
      window.ToastManager = this;
    }
  }
  
  /**
   * 註冊 toast 回調函數
   * @param {Object} callbacks - 包含 toast 類型和回調函數的對象
   */
  registerCallbacks(callbacks) {
    if (callbacks.success) this.callbacks.success = callbacks.success;
    if (callbacks.error) this.callbacks.error = callbacks.error;
    if (callbacks.info) this.callbacks.info = callbacks.info;
    if (callbacks.warning) this.callbacks.warning = callbacks.warning;
    
    console.log('Toast 回調已註冊');
  }
  
  /**
   * 顯示成功通知
   * @param {string} title - 通知標題
   * @param {string} message - 通知消息
   * @param {Object} options - 額外選項
   */
  showSuccess(title, message, options = {}) {
    console.log('成功通知:', title, message);
    if (this.callbacks.success) {
      return this.callbacks.success(title, message, options);
    }
  }
  
  /**
   * 顯示錯誤通知
   * @param {string} title - 通知標題
   * @param {string} message - 通知消息
   * @param {Object} options - 額外選項
   */
  showError(title, message, options = {}) {
    console.log('錯誤通知:', title, message);
    if (this.callbacks.error) {
      return this.callbacks.error(title, message, options);
    }
  }
  
  /**
   * 顯示信息通知
   * @param {string} title - 通知標題
   * @param {string} message - 通知消息
   * @param {Object} options - 額外選項
   */
  showInfo(title, message, options = {}) {
    console.log('信息通知:', title, message);
    if (this.callbacks.info) {
      return this.callbacks.info(title, message, options);
    }
  }
  
  /**
   * 顯示警告通知
   * @param {string} title - 通知標題
   * @param {string} message - 通知消息
   * @param {Object} options - 額外選項
   */
  showWarning(title, message, options = {}) {
    console.log('警告通知:', title, message);
    if (this.callbacks.warning) {
      return this.callbacks.warning(title, message, options);
    }
  }
}

// 創建單例
const toastManager = new ToastManager();

export default toastManager;