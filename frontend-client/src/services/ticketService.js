import authService from './authService';
import { validateApiPath } from '../utils/apiUtils';

const API_BASE_PATH = '/api/users/me/tickets';
const { axiosInstance } = authService;

// 獲取用戶所有票券（分頁）
const getUserTickets = async (page = 0, size = 10) => {
  const path = validateApiPath(`${API_BASE_PATH}?page=${page}&size=${size}`);
  return axiosInstance.get(path);
};

// 獲取特定票券詳情（包含QR碼）
const getTicketDetail = async (ticketId) => {
  const path = validateApiPath(`${API_BASE_PATH}/${ticketId}`);
  return axiosInstance.get(path);
};

const TicketService = {
  getUserTickets,
  getTicketDetail
};

export default TicketService;