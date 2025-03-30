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
  // 將前端的資料模型轉換為後端需要的模型
  const requestData = {
    concertId: Number(performanceData.concertId), // 確保是數字
    startTime: performanceData.performanceDateTime,
    duration: Number(performanceData.duration), // 演出時長（分鐘）
    venue: performanceData.venue || '數位音樂廳主廳',
    status: performanceData.status,
    livestreamUrl: performanceData.streamingUrl || null,
    recordingUrl: performanceData.recordingUrl || null
  };
  
  console.log('Sending performance creation request:', requestData);
  return axiosInstance.post('/api/admin/performances', requestData);
};

// 更新演出場次
const updatePerformance = (id, performanceData) => {
  const requestData = {
    concertId: Number(performanceData.concertId), // 確保是數字
    startTime: performanceData.performanceDateTime,
    duration: Number(performanceData.duration), // 演出時長（分鐘）
    venue: performanceData.venue || '數位音樂廳主廳',
    status: performanceData.status,
    livestreamUrl: performanceData.streamingUrl || null,
    recordingUrl: performanceData.recordingUrl || null
  };
  
  console.log('Sending performance update request:', requestData);
  return axiosInstance.put(`/api/admin/performances/${id}`, requestData);
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