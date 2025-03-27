import authService from './authService';

const API_URL = '/api/users/me/orders';
const { axiosInstance } = authService;

// 獲取用戶所有訂單（分頁）
const getUserOrders = async (page = 0, size = 10) => {
  return axiosInstance.get(`${API_URL}?page=${page}&size=${size}`);
};

// 獲取特定訂單詳情
const getOrderDetail = async (orderNumber) => {
  return axiosInstance.get(`${API_URL}/${orderNumber}`);
};

const OrderService = {
  getUserOrders,
  getOrderDetail
};

export default OrderService;
