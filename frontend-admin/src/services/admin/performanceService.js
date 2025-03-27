import AuthService from '../authService';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有演出場次
const getAllPerformances = () => {
  return axiosInstance.get('/api/admin/performances');
};

// 獲取單個演出場次
const getPerformanceById = (id) => {
  return axiosInstance.get(`/api/admin/performances/${id}`);
};

// 根據音樂會ID獲取演出場次
const getPerformancesByConcertId = (concertId) => {
  return axiosInstance.get(`/api/admin/performances/concert/${concertId}`);
};

// 創建新演出場次
const createPerformance = (performanceData) => {
  return axiosInstance.post('/api/admin/performances', performanceData);
};

// 更新演出場次
const updatePerformance = (id, performanceData) => {
  return axiosInstance.put(`/api/admin/performances/${id}`, performanceData);
};

// 刪除演出場次
const deletePerformance = (id) => {
  return axiosInstance.delete(`/api/admin/performances/${id}`);
};

// 更新演出場次狀態
const updatePerformanceStatus = (id, status) => {
  return axiosInstance.patch(`/api/admin/performances/${id}/status?status=${status}`);
};

const PerformanceService = {
  getAllPerformances,
  getPerformanceById,
  getPerformancesByConcertId,
  createPerformance,
  updatePerformance,
  deletePerformance,
  updatePerformanceStatus
};

export default PerformanceService;