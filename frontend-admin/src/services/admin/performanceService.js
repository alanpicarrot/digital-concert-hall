import AuthService from '../authService';
import { validateApiPath } from "../../utils/apiUtils";
import { setupAuthHeaders } from "../../utils/authPersistUtils";

const axiosInstance = AuthService.axiosInstance;

// 獲取所有演出場次
const getAllPerformances = () => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  const path = validateApiPath('/api/admin/performances');
  return axiosInstance.get(path);
};

// 獲取單個演出場次
const getPerformanceById = (id) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  const path = validateApiPath(`/api/admin/performances/${id}`);
  return axiosInstance.get(path);
};

// 根據音樂會ID獲取演出場次
const getPerformancesByConcertId = (concertId) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  const path = validateApiPath(`/api/admin/performances/concert/${concertId}`);
  return axiosInstance.get(path);
};

// 創建新演出場次
const createPerformance = (performanceData) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
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
  const path = validateApiPath('/api/admin/performances');
  return axiosInstance.post(path, requestData);
};

// 更新演出場次
const updatePerformance = (id, performanceData) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
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
  const path = validateApiPath(`/api/admin/performances/${id}`);
  return axiosInstance.put(path, requestData);
};

// 刪除演出場次
const deletePerformance = (id) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  const path = validateApiPath(`/api/admin/performances/${id}`);
  return axiosInstance.delete(path);
};

// 更新演出場次狀態
const updatePerformanceStatus = (id, status) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  const path = validateApiPath(`/api/admin/performances/${id}/status?status=${status}`);
  return axiosInstance.patch(path);
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