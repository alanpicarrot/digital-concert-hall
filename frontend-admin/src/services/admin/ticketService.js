import AuthService from '../authService';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有票券
const getAllTickets = () => {
  return axiosInstance.get('/api/admin/tickets');
};

// 獲取單個票券
const getTicketById = (id) => {
  return axiosInstance.get(`/api/admin/tickets/${id}`);
};

// 根據演出場次ID獲取票券
const getTicketsByPerformanceId = (performanceId) => {
  return axiosInstance.get(`/api/admin/tickets/performance/${performanceId}`);
};

// 創建新票券
const createTicket = (ticketData) => {
  return axiosInstance.post('/api/admin/tickets', ticketData);
};

// 更新票券
const updateTicket = (id, ticketData) => {
  return axiosInstance.put(`/api/admin/tickets/${id}`, ticketData);
};

// 刪除票券
const deleteTicket = (id) => {
  return axiosInstance.delete(`/api/admin/tickets/${id}`);
};

// 更新票券庫存
const updateTicketInventory = (id, totalQuantity, availableQuantity) => {
  let url = `/api/admin/tickets/${id}/inventory?`;
  
  if (totalQuantity !== undefined) {
    url += `totalQuantity=${totalQuantity}`;
  }
  
  if (availableQuantity !== undefined) {
    url += `${totalQuantity !== undefined ? '&' : ''}availableQuantity=${availableQuantity}`;
  }
  
  return axiosInstance.patch(url);
};

const TicketService = {
  getAllTickets,
  getTicketById,
  getTicketsByPerformanceId,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketInventory
};

export default TicketService;