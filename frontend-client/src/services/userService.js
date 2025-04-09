import axios from 'axios';
import { validateApiPath } from '../utils/apiUtils';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * 用戶服務，處理用戶相關的API請求
 */
const userService = {
  /**
   * 獲取當前用戶資料
   * @returns {Promise<Object>} 用戶資料
   */
  getCurrentUser: async () => {
    try {
      const path = validateApiPath('/api/user/profile');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      throw error;
    }
  },

  /**
   * 更新用戶個人資料
   * @param {Object} userData - 更新的用戶資料
   * @returns {Promise<Object>} 更新後的用戶資料
   */
  updateProfile: async (userData) => {
    try {
      const path = validateApiPath('/api/user/profile');
      const response = await axios.put(`${API_URL}${path}`, userData);
      return response.data;
    } catch (error) {
      console.error('更新用戶資料失敗:', error);
      throw error;
    }
  },

  /**
   * 獲取用戶購買的票券列表
   * @returns {Promise<Array>} 票券列表
   */
  getUserTickets: async () => {
    try {
      const path = validateApiPath('/api/user/tickets');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error('獲取用戶票券失敗:', error);
      throw error;
    }
  },

  /**
   * 獲取特定票券詳情
   * @param {string} ticketId - 票券ID
   * @returns {Promise<Object>} 票券詳情
   */
  getTicketDetails: async (ticketId) => {
    try {
      const path = validateApiPath(`/api/user/tickets/${ticketId}`);
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error('獲取票券詳情失敗:', error);
      throw error;
    }
  },

  /**
   * 獲取用戶訂單歷史
   * @returns {Promise<Array>} 訂單列表
   */
  getUserOrders: async () => {
    try {
      const path = validateApiPath('/api/user/orders');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error('獲取用戶訂單失敗:', error);
      throw error;
    }
  },

  /**
   * 獲取訂單詳情
   * @param {string} orderId - 訂單ID
   * @returns {Promise<Object>} 訂單詳情
   */
  getOrderDetails: async (orderId) => {
    try {
      const path = validateApiPath(`/api/user/orders/${orderId}`);
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error);
      throw error;
    }
  },

  /**
   * 更新用戶密碼
   * @param {Object} passwordData - 包含舊密碼與新密碼的物件
   * @returns {Promise<Object>} 操作結果
   */
  updatePassword: async (passwordData) => {
    try {
      const path = validateApiPath('/api/user/password');
      const response = await axios.put(`${API_URL}${path}`, passwordData);
      return response.data;
    } catch (error) {
      console.error('更新密碼失敗:', error);
      throw error;
    }
  }
};

export default userService;
