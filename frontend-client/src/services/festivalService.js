import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";
import authService from "./authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 創建帶有授權功能的 axios 實例
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// 添加請求攔截器自動添加授權標頭
authAxios.interceptors.request.use(config => {
  const token = authService.getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 創建不需授權的 axios 實例，用於公開資源
const publicAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 錯誤攔截器
const errorInterceptor = (error) => {
  console.error("音樂節 API 錯誤:", error.config?.url);
  console.error("錯誤消息:", error.message);
  
  if (error.response) {
    // 伺服器回應了錯誤
    console.error("響應狀態碼:", error.response.status);
    console.error("響應數據:", error.response.data);
    
    // 處理 401 未授權錯誤
    if (error.response.status === 401) {
      console.warn("需要身份驗證，嘗試重新登入...");
      // 可以在這裡觸發重新登入流程
    }
  } else {
    console.error("網絡錯誤或後端服務未運行");
  }
  
  return Promise.reject(error);
};

// 添加錯誤攔截器
authAxios.interceptors.response.use(response => response, errorInterceptor);
publicAxios.interceptors.response.use(response => response, errorInterceptor);

const festivalService = {
  // 獲取所有音樂節
  getAllFestivals: async () => {
    try {
      console.log("獲取所有音樂節數據...");
      
      // 首先嘗試使用公開 API 獲取
      try {
        const path = "/api/festivals";
        console.debug(`嘗試使用公開路徑獲取: ${API_URL}${path}`);
        const response = await publicAxios.get(path);
        console.debug(`成功獲取音樂節數據，數量: ${response.data.length}`);
        return response.data;
      } catch (publicError) {
        console.warn("公開 API 請求失敗，嘗試使用授權請求...", publicError.message);
        
        // 如果公開 API 失敗，嘗試使用授權 API
        if (publicError.response?.status === 401) {
          // 檢查是否已登入
          if (!authService.isAuthenticated()) {
            console.warn("需要登入才能獲取音樂節數據");
            // 這裡可以觸發登入提示
            return [];
          }
          
          const path = "/api/festivals";
          console.debug(`嘗試使用授權路徑獲取: ${API_URL}${path}`);
          const response = await authAxios.get(path);
          console.debug(`授權請求成功獲取音樂節數據，數量: ${response.data.length}`);
          return response.data;
        }
        
        // 如果錯誤不是 401，則拋出錯誤
        throw publicError;
      }
    } catch (error) {
      console.error("獲取音樂節數據失敗:", error.message);
      return [];
    }
  },
  
  // 獲取特定音樂節
  getFestivalById: async (id) => {
    try {
      console.log(`獲取音樂節 ID ${id} 的詳情...`);
      
      // 首先嘗試使用公開 API
      try {
        const path = `/api/festivals/${id}`;
        const response = await publicAxios.get(path);
        console.debug(`成功獲取音樂節詳情:`, response.data);
        return response.data;
      } catch (publicError) {
        console.warn(`公開 API 請求失敗，嘗試使用授權請求獲取音樂節 ID ${id}...`);
        
        // 如果需要授權
        if (publicError.response?.status === 401) {
          const path = `/api/festivals/${id}`;
          const response = await authAxios.get(path);
          console.debug(`授權請求成功獲取音樂節詳情:`, response.data);
          return response.data;
        }
        
        throw publicError;
      }
    } catch (error) {
      console.error(`獲取音樂節 ID ${id} 失敗:`, error.message);
      return null;
    }
  },
  
  // 獲取熱門或推薦的音樂節
  getFeaturedFestivals: async () => {
    try {
      const path = "/api/festivals/featured";
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取推薦音樂節失敗:", error.message);
      return [];
    }
  },
  
  // 搜索音樂節
  searchFestivals: async (query) => {
    try {
      const path = `/api/festivals/search?q=${encodeURIComponent(query)}`;
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("搜索音樂節失敗:", error.message);
      return [];
    }
  },
  
  // 創建模擬數據，用於前端開發測試
  _getMockFestivals: () => {
    return [
      {
        id: 101,
        name: "台北爵士音樂節",
        description: "台北市年度爵士音樂盛會，匯集國內外頂尖爵士音樂家。",
        startDate: "2025-07-15T00:00:00",
        endDate: "2025-07-18T23:59:59",
        venue: "台北市大安森林公園",
        posterUrl: "/assets/images/festival-posters/taipei-jazz.jpg",
        status: "upcoming",
        events: [
          {
            id: 1001,
            name: "開幕式表演",
            description: "由知名爵士樂團帶來精彩演出",
            startTime: "2025-07-15T19:00:00",
            venue: "主舞台"
          },
          {
            id: 1002,
            name: "爵士大師班",
            description: "國際知名爵士鋼琴家教學分享",
            startTime: "2025-07-16T14:00:00",
            venue: "