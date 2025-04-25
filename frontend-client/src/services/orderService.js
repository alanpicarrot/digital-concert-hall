import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';

const API_BASE_PATH = '/api/orders';
const USER_ORDERS_PATH = '/api/orders/me';
const { axiosInstance } = authService;

// 獲取用戶所有訂單（分頁）
const getUserOrders = async (page = 0, size = 10) => {
  try {
    const path = validateApiPath(`${USER_ORDERS_PATH}?page=${page}&size=${size}`);
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// 獲取特定訂單詳情（使用通用API路徑，不依賴用戶特定路徑）
const getOrderDetail = async (orderNumber, options = {}) => {
  try {
    // 使用相同的重試邏輯，但先檢查訂單是否存在
    const exists = await checkOrderExists(orderNumber);
    
    // 如果明確知道訂單不存在，可以立即提前返回錯誤
    if (exists === false) {
      console.log(`訂單 ${orderNumber} 確認不存在，不嘗試獲取詳情`);
      const error = new Error(`Order ${orderNumber} does not exist`);
      error.isOrderNotFound = true;
      throw error;
    }
    
    // 使用帶有重試的方法獲取訂單詳情
    return await getOrderByNumber(orderNumber, options);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

// 通過訂單號碼直接獲取訂單（包含自動重試機制）
 const getOrderByNumber = async (orderNumber, options = {}) => {
  const { maxRetries = 3, retryDelay = 1000, exponentialBackoff = true } = options;
  let retryCount = 0;
  let lastError = null;
  
  // 指數退避延遲計算
  const getDelay = (attempt) => {
    if (!exponentialBackoff) return retryDelay;
    return Math.min(retryDelay * Math.pow(2, attempt), 10000); // 最大10秒
  };
  
  while (retryCount <= maxRetries) {
    try {
      const path = validateApiPath(`${API_BASE_PATH}/${orderNumber}`);
      console.log(`嘗試獲取訂單 ${orderNumber} (嘗試 ${retryCount+1}/${maxRetries+1})`);
      const response = await axiosInstance.get(path);
      return response.data;
    } catch (error) {
      lastError = error;
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      // 檢查是否是訂單不存在錯誤
      const isOrderNotFoundError = error.response && 
        (error.response.status === 404 || error.response.status === 500) && 
        error.response.data?.message?.includes('Order not found');
      
      if (isOrderNotFoundError) {
        console.log(`訂單 ${orderNumber} 未找到 (嘗試 ${retryCount+1}/${maxRetries+1})`);
        error.isOrderNotFound = true;
        
        // 只有在訂單不存在的情況下重試
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = getDelay(retryCount);
          console.log(`將在 ${delay}ms 後重試...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // 其他錯誤不重試
        console.error(`獲取訂單 ${orderNumber} 失敗: ${errorMessage}`, error);
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        break;
      }
    }
    
    retryCount++;
  }
  
  // 如果是訂單不存在錯誤，創建一個自定義錯誤
  if (lastError && lastError.isOrderNotFound) {
    const customError = new Error(`Order not found after ${retryCount} attempts`);
    customError.isOrderNotFound = true;
    throw customError;
  }
  
  throw lastError || new Error(`Failed to fetch order ${orderNumber} after ${retryCount} attempts`);
};

// 創建訂單
const createOrder = async (cartData) => {
  try {
    console.log('開始創建訂單...');
    
    if (cartData && cartData.items && Array.isArray(cartData.items)) {
      // log 所有 item 的 id
      cartData.items.forEach((item, idx) => {
        console.log(`訂單項目[${idx}] id:`, item.id, '完整項目:', item);
      });

      cartData.items = cartData.items.map((item, idx) => {
        if (
          item.id !== undefined &&
          item.id !== null &&
          item.id !== '' &&
          !(typeof item.id === 'number' && isNaN(item.id))
        ) {
          item.id = String(item.id);

          const checkoutInfoStr = sessionStorage.getItem('checkoutInfo');
          if (checkoutInfoStr) {
            try {
              const checkoutInfo = JSON.parse(checkoutInfoStr);
              if (checkoutInfo.concertId) {
                item.concertId = checkoutInfo.concertId;
                console.log(`已添加音樂會ID: ${checkoutInfo.concertId}到訂單項目[${idx}]`);
              }
            } catch (e) {
              console.error('解析結帳信息時出錯:', e);
            }
          }
        } else {
          console.error(`訂單項目[${idx}]缺少ID:`, item);
          throw new Error(`訂單項目[${idx}]缺少必要的ID`);
        }
        return item;
      });

      // 新增：送出前 log 所有 items
      console.log('送出前所有訂單項目:', cartData.items);
    } else {
      console.error('創建訂單時缺少有效的購物車數據');
      throw new Error('缺少有效的購物車數據');
    }
    
    console.log('處理後的訂單數據:', JSON.stringify(cartData));
    const path = validateApiPath(API_BASE_PATH);
    const response = await axiosInstance.post(path, cartData);
    const orderData = response.data;
    
    // 創建訂單成功後，記錄訂單號以便追蹤
    console.log(`訂單創建成功: ${orderData.orderNumber}`);
    
    // 訂單創建成功後短暫等待，確保數據庫同步
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return orderData;
  } catch (error) {
    console.error('創建訂單時發生錯誤:', error);
    const errorMessage = error.response?.data?.message || error.message || '創建訂單失敗';
    
    // 創建自定義錯誤以便更好地在UI中顯示
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.details = error.response?.data;
    throw customError;
  }
};

// 檢查訂單是否存在 (輕量級檢查，不返回完整訂單)
const checkOrderExists = async (orderNumber) => {
  try {
    const path = validateApiPath(`${API_BASE_PATH}/${orderNumber}/exists`);
    const response = await axiosInstance.get(path);
    return response.data.exists;
  } catch (error) {
    // 如果端點不存在，假設為後端未實現該功能，返回null表示未知
    if (error.response && error.response.status === 404) {
      console.log('訂單存在檢查API未實現，使用標準方式檢查');
      return null;
    }
    
    // 如果是授權問題，返回null
    if (error.response && error.response.status === 401) {
      console.log('授權失敗，無法檢查訂單是否存在');
      return null;
    }
    
    // 其他錯誤都當作訂單不存在
    return false;
  }
};

const OrderService = {
  getUserOrders,
  getOrderDetail,
  getOrderByNumber,
  createOrder,
  checkOrderExists
};

export default OrderService;