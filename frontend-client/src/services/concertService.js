import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 創建唯一的 axios 實例，添加錯誤攔截器
const publicAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加錯誤攔截器，提供詳細的診斷信息
publicAxios.interceptors.response.use(
  (response) => {
    console.debug(
      "Concert API Response:",
      response.config.url,
      response.status
    );
    return response;
  },
  (error) => {
    console.error("API 錯誤:", error.config?.url);
    console.error("錯誤消息:", error.message);
    
    if (error.response) {
      console.error("響應狀態碼:", error.response.status);
      console.error("響應數據:", error.response.data);
    } else {
      console.error("無響應數據，可能是網絡問題或後端服務器未運行");
      console.error("請確保後端服務器在 http://localhost:8080 運行");
    }
    
    return Promise.reject(error);
  }
);

const concertService = {
  // 獲取所有音樂會
  getAllConcerts: async () => {
    try {
      console.debug("正在獲取音樂會列表...");
      
      const path = "/api/concerts";
      console.debug(`請求音樂會列表: ${API_URL}${path}`);
      
      const response = await publicAxios.get(path);
      
      if (response.data && Array.isArray(response.data)) {
        console.debug(`成功獲取音樂會列表，數量: ${response.data.length}`);
        
        if (response.data.length === 0) {
          console.warn('警告: 音樂會列表為空，管理後台(3001)創建的資料可能未寫入 H2 資料庫');
          console.warn('請確保管理後台已正確寫入數據到 H2 資料庫');
        }
        
        // 即使是空數組也返回，避免使用過多模擬數據干擾測試
        return response.data;
      } else {
        console.error('響應格式不正確，預期數組但收到:', response.data);
        return []; // 返回空數組
      }
    } catch (error) {
      console.error("獲取音樂會列表失敗:", error.message);
      console.error("請求URL:", `${API_URL}/api/concerts`);
      console.error("請確認後端服務是否啟動並可在端口 8080 訪問");
      
      // 返回空數組，避免使用模擬數據
      return [];
    }
  },

  // 根據ID獲取音樂會詳情
  getConcertById: async (id) => {
    if (!id) {
      throw new Error("Concert ID is required");
    }

    try {
      const path = validateApiPath(`/api/concerts/${id}`);
      console.log(`獲取音樂會詳情: ${path}`);
      const response = await publicAxios.get(path);
      console.log(`成功獲取音樂會詳情`);
      return response.data;
    } catch (error) {
      console.error(`獲取音樂會 ${id} 詳情失敗:`, error);
      return null; // 返回 null 而不是模擬數據
    }
  },

  // 獲取即將上演的音樂會
  getUpcomingConcerts: async () => {
    try {
      const path = validateApiPath("/api/concerts/upcoming");
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取即將上演音樂會失敗:", error);
      return []; // 返回空數組
    }
  },

  // 獲取過去的音樂會
  getPastConcerts: async () => {
    try {
      const path = validateApiPath("/api/concerts/past");
      const response = await publicAxios.get(path);
      return response.data;
    } catch (error) {
      console.error("獲取過去音樂會失敗:", error);
      return []; // 返回空數組
    }
  },

  // 獲取特定音樂會的票券詳情
  getTicketDetails: async (concertId, ticketType) => {
    try {
      console.log(`開始獲取音樂會 ${concertId} 的 ${ticketType} 票券詳情...`);
      
      // 獲取音樂會詳情
      const concertPath = validateApiPath(`/api/concerts/${concertId}`);
      console.log(`請求音樂會詳情: ${API_URL}${concertPath}`);
      
      const concertResponse = await publicAxios.get(concertPath);
      const concertData = concertResponse.data;
      
      // 獲取表演場次
      const performanceId = concertData.performances?.[0]?.id;
      if (!performanceId) {
        console.error("此音樂會無可用表演場次");
        return null;
      }

      // 獲取表演場次詳情
      const performancePath = validateApiPath(`/api/performances/${performanceId}`);
      const performanceResponse = await publicAxios.get(performancePath);
      const performanceData = performanceResponse.data;
      
      // 獲取票券數據
      const ticketsPath = validateApiPath(`/api/performances/${performanceId}/tickets`);
      const ticketsResponse = await publicAxios.get(ticketsPath);
      const tickets = ticketsResponse.data;
      
      if (!tickets || tickets.length === 0) {
        console.log(`未找到任何票券`);
        return null;
      }

      // 尋找匹配票券類型的票券
      let ticketDetails = tickets.find(
        (ticket) => ticket.name?.toLowerCase() === ticketType?.toLowerCase()
      );

      // 嘗試其他匹配方式
      if (!ticketDetails) {
        ticketDetails = tickets.find(
          (ticket) => ticket.ticketType?.name?.toLowerCase() === ticketType?.toLowerCase()
        );
      }

      // 如果仍然沒找到，使用第一個可用票券
      if (!ticketDetails) {
        console.log(`未找到匹配的 ${ticketType} 票券，使用第一個可用票券`);
        ticketDetails = tickets[0];
      }

      // 格式化數據
      const ticketName = ticketDetails.name || ticketDetails.ticketType?.name || ticketType || "一般票";
      const ticketDescription = ticketDetails.description || ticketDetails.ticketType?.description || "";
      const ticketPrice = ticketDetails.price || ticketDetails.ticketType?.price || 1000;
      const ticketColorCode = ticketDetails.colorCode || ticketDetails.ticketType?.colorCode || "#4f46e5";
      const ticketQuantity = ticketDetails.availableQuantity || 50;

      // 返回格式化的票券數據
      return {
        id: ticketDetails.id,
        type: ticketName,
        price: ticketPrice,
        description: ticketDescription,
        availableQuantity: ticketQuantity,
        available: ticketQuantity > 0,
        colorCode: ticketColorCode,
        concert: concertData,
        performance: {
          id: performanceData.id,
          startTime: performanceData.startTime,
          endTime: performanceData.endTime,
          venue: performanceData.venue,
          status: performanceData.status,
          duration: performanceData.duration
        }
      };
    } catch (error) {
      console.error("獲取票券詳情失敗:", error);
      return null; // 返回 null 而不是模擬數據
    }
  }
};

export default concertService;
