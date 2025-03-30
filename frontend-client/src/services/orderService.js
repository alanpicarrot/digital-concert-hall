import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';

const API_BASE_PATH = '/api/users/me/orders';
const { axiosInstance } = authService;

// 獲取用戶所有訂單（分頁）
const getUserOrders = async (page = 0, size = 10) => {
  const path = validateApiPath(`${API_BASE_PATH}?page=${page}&size=${size}`);
  return axiosInstance.get(path);
};

// 獲取特定訂單詳情
const getOrderDetail = async (orderNumber) => {
  const path = validateApiPath(`${API_BASE_PATH}/${orderNumber}`);
  return axiosInstance.get(path);
};

const OrderService = {
  getUserOrders,
  getOrderDetail
};

export default OrderService;