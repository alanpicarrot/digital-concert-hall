import AuthService from "../authService";
import { validateApiPath } from "../../utils/apiUtils";
import { setupAuthHeaders } from "../../utils/authPersistUtils";

const axiosInstance = AuthService.axiosInstance;

// 獲取所有音樂會
const getAllConcerts = async () => {
  console.log("總計: 檢索所有音樂會...");
  
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath("/api/admin/concerts");
    console.log(`請求路徑: ${path}`);
    
    // 非常詳細的記錄
    const token = localStorage.getItem("adminToken");
    console.log(`發送請求時的授權狀態: ${token ? "有令牌" : "無令牌"}`);  
    
    if (!token) {
      console.warn("沒有發現有效的認證令牌，可能導致檢索失敗");
    }
    
    const response = await axiosInstance.get(path);
    console.log(`成功獲取音樂會數據，數量: ${response.data.length || 0}`);
    return response;
  } catch (error) {
    console.error("獲取音樂會列表失敗:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// 獲取單個音樂會
const getConcertById = async (id) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath(`/api/admin/concerts/${id}`);
    const response = await axiosInstance.get(path);
    return response;
  } catch (error) {
    console.error(`獲取音樂會 ${id} 失敗:`, error);
    throw error;
  }
};

// 創建新音樂會
const createConcert = async (concertData) => {
  console.log("創建新音樂會:", concertData);
  
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath("/api/admin/concerts");
    const response = await axiosInstance.post(path, concertData);
    console.log("創建音樂會成功:", response.data);
    return response;
  } catch (error) {
    console.error("創建音樂會失敗:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response && error.response.status === 403) {
      console.error("權限被拒絕，請確認您有管理員權限");
    }
    throw error;
  }
};

// 更新音樂會
const updateConcert = async (id, concertData) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath(`/api/admin/concerts/${id}`);
    const response = await axiosInstance.put(path, concertData);
    return response;
  } catch (error) {
    console.error(`更新音樂會 ${id} 失敗:`, error);
    throw error;
  }
};

// 刪除音樂會
const deleteConcert = async (id) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath(`/api/admin/concerts/${id}`);
    const response = await axiosInstance.delete(path);
    return response;
  } catch (error) {
    console.error(`刪除音樂會 ${id} 失敗:`, error);
    throw error;
  }
};

// 更新音樂會狀態
const updateConcertStatus = async (id, status) => {
  // 確保授權頭部正確設置
  setupAuthHeaders();
  
  try {
    const path = validateApiPath(
      `/api/admin/concerts/${id}/status?status=${status}`
    );
    const response = await axiosInstance.patch(path);
    return response;
  } catch (error) {
    console.error(`更新音樂會 ${id} 的狀態失敗:`, error);
    throw error;
  }
};

const ConcertService = {
  getAllConcerts,
  getConcertById,
  createConcert,
  updateConcert,
  deleteConcert,
  updateConcertStatus,
};

export default ConcertService;