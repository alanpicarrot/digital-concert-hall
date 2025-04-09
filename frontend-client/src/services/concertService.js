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

  // 測試數據創建功能
  createTestData: async () => {
    try {
      const path = validateApiPath('/api/concerts/test-data');
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      throw error;
    }
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

  // 獲取特定音樂會的票券詳情
  getTicketDetails: async (concertId, ticketType) => {
    try {
      // 根據音樂會ID獲取音樂會詳情
      const concertPath = validateApiPath(`/api/concerts/${concertId}`);
      const concertResponse = await axios.get(`${API_URL}${concertPath}`);
      const concertData = concertResponse.data;
      
      // 獲取該音樂會的可用票券
      const performanceId = concertData.performances?.[0]?.id;
      if (!performanceId) {
        throw new Error('此音樂會無可用表演場次');
      }
      
      // 根據表演場次獲取票券
      const ticketsPath = validateApiPath(`/api/performances/${performanceId}/tickets`);
      const ticketsResponse = await axios.get(`${API_URL}${ticketsPath}`);
      const tickets = ticketsResponse.data;
      
      // 尋找匹配票券類型的票券
      const ticketDetails = tickets.find(ticket => 
        ticket.ticketType.name.toLowerCase() === ticketType.toLowerCase());
      
      if (!ticketDetails) {
        // 如果API調用失敗或找不到匹配的票券，使用模擬數據
        console.log('無法從API獲取票券詳情，使用模擬數據');
        
        // 創建模擬票券信息
        return {
          id: 1,
          type: ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
          price: ticketType.toLowerCase() === 'vip' ? 2000 : 1000,
          description: ticketType.toLowerCase() === 'vip' ? 
            '前排最佳視聽位置，附贈節目冊' : '標準座位區，良好視聽體驗',
          availableQuantity: 50,
          colorCode: ticketType.toLowerCase() === 'vip' ? '#4f46e5' : '#22c55e',
          concert: concertData,
          performance: {
            startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            venue: '數位音樂廳主廳'
          }
        };
      }
      
      // 格式化返回數據
      return {
        id: ticketDetails.id,
        type: ticketDetails.ticketType.name,
        price: ticketDetails.price,
        description: ticketDetails.ticketType.description,
        availableQuantity: ticketDetails.availableQuantity,
        colorCode: ticketDetails.ticketType.colorCode,
        concert: concertData,
        performance: ticketDetails.performance
      };
    } catch (error) {
      console.error('獲取票券詳情失敗:', error);
      
      // 如果出錯，返回模擬數據
      return {
        id: 1,
        type: ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
        price: ticketType.toLowerCase() === 'vip' ? 2000 : 1000,
        description: ticketType.toLowerCase() === 'vip' ? 
          '前排最佳視聽位置，附贈節目冊' : '標準座位區，良好視聽體驗',
        availableQuantity: 50,
        colorCode: ticketType.toLowerCase() === 'vip' ? '#4f46e5' : '#22c55e',
        concert: {
          id: concertId,
          title: '模擬音樂會',
          description: '此為模擬數據，因為無法從API獲取真實數據',
          posterUrl: null
        },
        performance: {
          startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          venue: '數位音樂廳主廳'
        }
      };
    }
  },

};

export default concertService;
