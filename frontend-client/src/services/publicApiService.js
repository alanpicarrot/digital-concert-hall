import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
// 後端服務正確的端口

// 創建不帶認證的 axios 實例
const publicAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApiService = {
  getAllConcerts: async () => {
    try {
      // 修正路徑處理，不使用 validateApiPath
      const path = "/api/concerts";
      console.log(`產生的音樂會列表請求路徑: ${API_URL}${path}`);
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取音樂會列表失敗:", error.message);
      return [];
    }
  },

  getUpcomingConcerts: async () => {
    try {
      // 修正路徑處理，不使用 validateApiPath
      const path = "/api/concerts/upcoming";
      console.log(`產生的請求路徑: ${API_URL}${path}`);
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取即將上演音樂會失敗:", error.message);
      return [];
    }
  },

  getPastConcerts: async () => {
    try {
      // 修正路徑處理，不使用 validateApiPath
      const path = "/api/concerts/past";
      console.log(`產生的請求路徑: ${API_URL}${path}`);
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取過去音樂會失敗:", error.message);
      return [];
    }
  },
};
