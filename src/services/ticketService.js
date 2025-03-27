import authService from './authService';

const API_URL = '/api/users/me/tickets';
const { axiosInstance } = authService;

// 獲取用戶所有票券（分頁）
const getUserTickets = async (page = 0, size = 10) => {
  return axiosInstance.get(`${API_URL}?page=${page}&size=${size}`);
};

// 獲取特定票券詳情（包含QR碼）
const getTicketDetail = async (ticketId) => {
  return axiosInstance.get(`${API_URL}/${ticketId}`);
};

const TicketService = {
  getUserTickets,
  getTicketDetail
};

export default TicketService;
