/**
 * 格式化日期時間
 * @param {string|Date} dateTime - 日期時間字符串或Date對象
 * @param {Object} options - 格式化選項
 * @param {boolean} options.withTime - 是否包含時間，默認為true
 * @returns {string} 格式化後的日期時間字符串
 */

/**
 * 計算兩個日期之間的差距（天數）
 * @param {string|Date} date1 - 第一個日期
 * @param {string|Date} date2 - 第二個日期
 * @returns {number} 天數差距
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // 轉換為毫秒並計算差距
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 檢查日期是否已過期（早於當前時間）
 * @param {string|Date} date - 要檢查的日期
 * @returns {boolean} 如果日期已過期則返回true
 */
export const isExpired = (date) => {
  const checkDate = new Date(date);
  const now = new Date();
  
  return checkDate < now;
};

/**
 * 獲取相對時間描述（例如：3天前、剛剛）
 * @param {string|Date} date - 日期時間
 * @returns {string} 相對時間描述
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffMs = now - pastDate;
  
  // 轉換為秒、分鐘、小時、天
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return '剛剛';
  } else if (diffMin < 60) {
    return `${diffMin}分鐘前`;
  } else if (diffHour < 24) {
    return `${diffHour}小時前`;
  } else if (diffDay < 30) {
    return `${diffDay}天前`;
  } else {
    // 超過30天，返回格式化日期
    return formatDate(date, { withTime: false });
  }
};

/**
 * 格式化持續時間（分鐘轉為小時和分鐘）
 * @param {number} minutes - 總分鐘數
 * @returns {string} 格式化後的持續時間
 */
export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) {
    return '未知時長';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}分鐘`;
  } else if (mins === 0) {
    return `${hours}小時`;
  } else {
    return `${hours}小時${mins}分鐘`;
  }
};

/**
 * 格式化日期 (Keep this one)
 * @param {string|Date} dateInput - 日期時間字符串或Date對象
 * @param {string} locale - 地區設定，例如 'zh-TW'
 * @param {Intl.DateTimeFormatOptions} options - Intl.DateTimeFormat 的選項
 * @returns {string} 格式化後的日期字符串
 */
export const formatDate = (dateInput, locale = 'zh-TW', options = { year: 'numeric', month: '2-digit', day: '2-digit' }) => {
  if (!dateInput) return '日期未知';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return '日期無效';
    }
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Format date error:', error, { dateInput, locale, options });
    return '日期格式錯誤';
  }
};

/**
 * 格式化時間 (Keep this one)
 * @param {string|Date} dateInput - 日期時間字符串或Date對象
 * @param {string} locale - 地區設定，例如 'zh-TW'
 * @param {Intl.DateTimeFormatOptions} options - Intl.DateTimeFormat 的選項
 * @returns {string} 格式化後的時間字符串
 */
export const formatTime = (dateInput, locale = 'zh-TW', options = { hour: '2-digit', minute: '2-digit', hour12: false }) => {
  if (!dateInput) return '時間未知';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return '時間無效';
    }
    return date.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('Format time error:', error, { dateInput, locale, options });
    return '時間格式錯誤';
  }
};

export default {
  formatDate,
  formatTime,
  daysBetween,
  isExpired,
  getRelativeTime,
  formatDuration
};