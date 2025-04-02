import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "";

// 設置基本 URL，如果不是 production 環境，使用代理
const concertService = {
  // 獲取所有活躍音樂會列表
  getAllConcerts: async () => {
    try {
      const path = validateApiPath('/api/concerts');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 測試端點 - 只保留健康檢查功能
  testHealthCheck: async () => {
    try {
      const path = validateApiPath('/api/concerts/health-check');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 已禁用測試數據創建功能
  createTestData: async () => {
    return { success: false, message: "測試數據創建功能已禁用，請通過管理後台手動創建音樂會和票種。" };
  },
  
  // 清除測試數據
  cleanTestData: async () => {
    try {
      const path = validateApiPath('/debug/clean-test-data');
      const response = await axios.get(`${API_URL}${path}`);
      return { success: true, message: response.data };
    } catch (error) {
      return { success: false, message: "清除測試數據失敗。" + (error.response?.data?.message || error.message) };
    }
  },

  // 獲取單個音樂會詳情
  getConcertById: async (id) => {
    try {
      const path = validateApiPath(`/api/concerts/${id}`);
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取即將上演的音樂會
  getUpcomingConcerts: async () => {
    try {
      const path = validateApiPath('/api/concerts/upcoming');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 獲取過往音樂會
  getPastConcerts: async () => {
    try {
      const path = validateApiPath('/api/concerts/past');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default concertService;
