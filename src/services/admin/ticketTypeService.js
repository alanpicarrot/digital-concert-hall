import AuthService from '../authService';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有票種
const getAllTicketTypes = () => {
  return axiosInstance.get('/api/admin/ticket-types');
};

// 獲取單個票種
const getTicketTypeById = (id) => {
  return axiosInstance.get(`/api/admin/ticket-types/${id}`);
};

// 創建新票種
const createTicketType = (ticketTypeData) => {
  return axiosInstance.post('/api/admin/ticket-types', ticketTypeData);
};

// 更新票種
const updateTicketType = (id, ticketTypeData) => {
  return axiosInstance.put(`/api/admin/ticket-types/${id}`, ticketTypeData);
};

// 刪除票種
const deleteTicketType = (id) => {
  return axiosInstance.delete(`/api/admin/ticket-types/${id}`);
};

const TicketTypeService = {
  getAllTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType
};

export default TicketTypeService;
