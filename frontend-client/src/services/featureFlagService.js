/**
 * Feature Flag 服務
 * 用於控制功能的開關，便於開發和測試
 */

const FeatureFlags = {
  // 支付相關
  USE_REAL_PAYMENT: false, // 開發階段設為false
  
  // 其他功能flags可在此添加
  ENABLE_TICKET_GENERATION: true,
  DEBUG_MODE: false,
  
  // 獲取flag值的方法
  isEnabled: function(flagName) {
    // 先檢查localStorage是否有覆寫設定
    const localOverride = localStorage.getItem(`flag_${flagName}`);
    if (localOverride !== null) {
      return localOverride === 'true';
    }
    
    // 如果沒有本地覆寫，可以從配置或環境變量中獲取
    // 目前僅返回預設值
    return this[flagName] === true;
  },
  
  // 方便開發時覆寫flag的方法
  setFlag: function(flagName, value) {
    localStorage.setItem(`flag_${flagName}`, value.toString());
    console.log(`Feature flag ${flagName} set to ${value}`);
  },
  
  // 重置所有flags到默認值
  resetAllFlags: function() {
    Object.keys(this).forEach(key => {
      if (typeof this[key] !== 'function') {
        localStorage.removeItem(`flag_${key}`);
      }
    });
    console.log('All feature flags reset to default values');
  },
  
  // 獲取所有flags的當前狀態
  getAllFlags: function() {
    const flags = {};
    Object.keys(this).forEach(key => {
      if (typeof this[key] !== 'function') {
        flags[key] = this.isEnabled(key);
      }
    });
    return flags;
  }
};

export default FeatureFlags;