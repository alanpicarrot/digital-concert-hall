/**
 * 支付服務
 * 整合支付相關 API
 */

import FeatureFlags from './featureFlagService';
import authService from './authService';

const API_BASE_PATH = '/api/payment';
const { axiosInstance } = authService;

/**
 * 創建支付訂單
 * @param {string} orderNumber - 訂單編號
 * @returns {Promise<Object>} - 支付結果
 */
const createPayment = async (orderNumber) => {
  try {
    // 使用Feature Flag決定使用哪種支付方式
    if (FeatureFlags.isEnabled('USE_REAL_PAYMENT')) {
      // 使用真實綠界支付
      console.log('使用真實支付閘道');
      const path = `${API_BASE_PATH}/ecpay/create?orderNumber=${orderNumber}`;
      const response = await axiosInstance.post(path);
      return response.data;
    } else {
      // 使用模擬支付
      console.log('使用模擬支付閘道');
      const path = `${API_BASE_PATH}/mock-payment?orderNumber=${orderNumber}`;
      
      try {
        const response = await axiosInstance.post(path);
        console.log('模擬支付API響應:', response.data);
        
        return {
          success: true,
          message: '模擬支付已處理',
          paymentUrl: `/payment/result?orderNumber=${orderNumber}&success=true&simulatedPayment=true`
        };
      } catch (error) {
        console.error('模擬支付API調用錯誤:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('創建支付訂單時出錯:', error);
    throw error;
  }
};

/**
 * 查詢支付狀態
 * @param {string} orderNumber - 訂單編號
 * @returns {Promise<Object>} - 支付狀態
 */
const getPaymentStatus = async (orderNumber) => {
  try {
    const path = `${API_BASE_PATH}/status?orderNumber=${orderNumber}`;
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    console.error('查詢支付狀態時出錯:', error);
    throw error;
  }
};

const PaymentService = {
  createPayment,
  getPaymentStatus
};

export default PaymentService;