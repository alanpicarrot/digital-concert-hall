import AuthService from '../authService';
import { validateApiPath } from '../../utils/apiUtils';

const axiosInstance = AuthService.axiosInstance;

// 獲取所有音樂會
const getAllConcerts = () => {
  console.log('總計: 検索所有音樂會...');
  const path = validateApiPath('/api/admin/concerts');
  return axiosInstance.get(path)
    .catch(error => {
      console.error('獲取音樂會列表失敗:', error.response ? error.response.data : error.message);
      throw error;
    });
};

// 獲取單個音樂會
const getConcertById = (id) => {
  const path = validateApiPath(`/api/admin/concerts/${id}`);
  return axiosInstance.get(path);
};

// 創建新音樂會
const createConcert = (concertData) => {
  console.log('創建新音樂會:', concertData);
  const path = validateApiPath('/api/admin/concerts');
  return axiosInstance.post(path, concertData)
    .catch(error => {
      console.error('創建音樂會失敗:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 403) {
        console.error('權限被拒絕，請確認您有管理員權限');
      }
      throw error;
    });
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