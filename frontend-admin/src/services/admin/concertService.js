import AuthService from '../authService';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有音樂會
const getAllConcerts = () => {
  return axiosInstance.get('/api/admin/concerts');
};

// 獲取單個音樂會
const getConcertById = (id) => {
  return axiosInstance.get(`/api/admin/concerts/${id}`);
};

// 創建新音樂會
const createConcert = (concertData) => {
  return axiosInstance.post('/api/admin/concerts', concertData);
};

// 更新音樂會
const updateConcert = (id, concertData) => {
  return axiosInstance.put(`/api/admin/concerts/${id}`, concertData);
};

// 刪除音樂會
const deleteConcert = (id) => {
  return axiosInstance.delete(`/api/admin/concerts/${id}`);
};

// 更新音樂會狀態
const updateConcertStatus = (id, status) => {
  return axiosInstance.patch(`/api/admin/concerts/${id}/status?status=${status}`);
};

const ConcertService = {
  getAllConcerts,
  getConcertById,
  createConcert,
  updateConcert,
  deleteConcert,
  updateConcertStatus
};

export default ConcertService;