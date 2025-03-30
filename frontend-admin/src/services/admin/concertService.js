import AuthService from '../authService';
import { validateApiPath } from '../../utils/apiUtils';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有音樂會
const getAllConcerts = () => {
  const path = validateApiPath('/api/admin/concerts');
  return axiosInstance.get(path);
};

// 獲取單個音樂會
const getConcertById = (id) => {
  const path = validateApiPath(`/api/admin/concerts/${id}`);
  return axiosInstance.get(path);
};

// 創建新音樂會
const createConcert = (concertData) => {
  const path = validateApiPath('/api/admin/concerts');
  return axiosInstance.post(path, concertData);
};

// 更新音樂會
const updateConcert = (id, concertData) => {
  const path = validateApiPath(`/api/admin/concerts/${id}`);
  return axiosInstance.put(path, concertData);
};

// 刪除音樂會
const deleteConcert = (id) => {
  const path = validateApiPath(`/api/admin/concerts/${id}`);
  return axiosInstance.delete(path);
};

// 更新音樂會狀態
const updateConcertStatus = (id, status) => {
  const path = validateApiPath(`/api/admin/concerts/${id}/status?status=${status}`);
  return axiosInstance.patch(path);
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