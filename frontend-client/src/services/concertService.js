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

  // 測試端點
  testHealthCheck: async () => {
    try {
      const path = validateApiPath('/api/concerts/health-check');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 創建測試數據
  createTestData: async () => {
    try {
      const path = validateApiPath('/api/concerts/test-data');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
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
