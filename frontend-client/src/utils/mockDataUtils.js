/**
 * 模擬數據工具函數
 * 用於標記和檢測應用是否正在使用模擬數據
 */

// 存儲使用模擬數據的狀態
let usingMockData = {
  performance: false,
  concert: false,
  ticket: false
};

// 自定義事件名稱
const MOCK_DATA_EVENT = 'mockDataUsed';

/**
 * 標記使用了模擬數據
 * @param {string} dataType 數據類型 ('performance', 'concert', 'ticket')
 * @param {object} data 模擬數據對象
 * @returns {object} 包含模擬數據標記的數據對象
 */
export const markAsMockData = (dataType, data) => {
  // 更新狀態
  usingMockData[dataType] = true;
  
  // 觸發自定義事件
  const mockEvent = new CustomEvent(MOCK_DATA_EVENT, { 
    detail: { 
      type: dataType, 
      timestamp: new Date(),
      data: data 
    } 
  });
  window.dispatchEvent(mockEvent);
  
  // 在控制台中添加明顯的標記
  console.warn(`[模擬數據] 正在使用${dataType}模擬數據`);
  
  // 為數據添加標記
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      _isMockData: true,
      _mockDataType: dataType
    }));
  }
  
  return {
    ...data,
    _isMockData: true,
    _mockDataType: dataType
  };
};

/**
 * 檢查數據是否為模擬數據
 * @param {object} data 要檢查的數據對象
 * @returns {boolean} 是否為模擬數據
 */
export const isMockData = (data) => {
  if (!data) return false;
  
  if (Array.isArray(data)) {
    return data.length > 0 && data[0]._isMockData === true;
  }
  
  return data._isMockData === true;
};

/**
 * 獲取當前使用模擬數據的狀態
 * @returns {object} 包含各類型模擬數據使用狀態的對象
 */
export const getMockDataStatus = () => {
  return { ...usingMockData };
};

/**
 * 重置模擬數據使用狀態
 */
export const resetMockDataStatus = () => {
  usingMockData = {
    performance: false,
    concert: false,
    ticket: false
  };
  console.log('[模擬數據] 狀態已重置');
};

/**
 * 註冊模擬數據使用事件監聽器
 * @param {function} callback 當使用模擬數據時調用的回調函數
 * @returns {function} 用於移除監聽器的函數
 */
export const onMockDataUsed = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(MOCK_DATA_EVENT, handler);
  
  // 返回移除監聽器的函數
  return () => window.removeEventListener(MOCK_DATA_EVENT, handler);
};

/**
 * 初始化模擬數據偵測功能，並將狀態添加到窗口對象中方便調試
 */
export const initMockDataDetection = () => {
  window.__mockDataStatus = usingMockData;
  window.__isMockDataMode = () => Object.values(usingMockData).some(v => v);
  window.__resetMockData = resetMockDataStatus;
  
  console.log('[模擬數據] 偵測功能已初始化，可使用 window.__mockDataStatus 檢查狀態');
};

export default {
  markAsMockData,
  isMockData,
  getMockDataStatus,
  resetMockDataStatus,
  onMockDataUsed,
  initMockDataDetection
};