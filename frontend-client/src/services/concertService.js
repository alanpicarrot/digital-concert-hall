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
          console.warn(
            "警告: 音樂會列表為空，管理後台(3001)創建的資料可能未寫入 H2 資料庫"
          );
          console.warn("請確保管理後台已正確寫入數據到 H2 資料庫");
        }

        // 即使是空數組也返回，避免使用過多模擬數據干擾測試
        return response.data;
      } else {
        console.error("響應格式不正確，預期數組但收到:", response.data);
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
      console.log(`獲取票券列表: ${ticketsPath}`);
      const ticketsResponse = await publicAxios.get(ticketsPath);
      let tickets = ticketsResponse.data;
      
      if (!tickets || tickets.length === 0) {
        console.log(`未找到任何票券，將使用模擬數據`);
        // 模擬數據 - 基本票券類型
        tickets = [
          {
            id: 1,
            name: 'VIP票',
            description: '前排最佳視聽位置，附贈節目冊',
            price: 2000,
            availableQuantity: 50,
            colorCode: '#4f46e5'
          },
          {
            id: 2,
            name: '標準票',
            description: '標準座位區，良好視聽體驗',
            price: 1000,
            availableQuantity: 100,
            colorCode: '#22c55e'
          }
        ];
      }

      // 更健壯的票券類型匹配邏輯
      console.log(`查找票券類型: "${ticketType}"，可用票券:`, tickets.map(t => t.name || t.ticketType?.name));
      
      // 尋找匹配票券類型的票券 - 使用更健壯的比較邏輯
      let ticketDetails = null;
      
      // 標準化比較 - 移除空格、轉小寫並跳過特殊字符
      const normalizeString = (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/[\s-_]/g, '');
      };
      
      const targetType = normalizeString(ticketType);
      
      // 多種匹配嘗試方法
      for (const ticket of tickets) {
        // 嘗試直接匹配name屬性
        if (normalizeString(ticket.name) === targetType) {
          ticketDetails = ticket;
          console.log(`找到完全匹配的票券: ${ticket.name}`);
          break;
        }
        
        // 嘗試匹配ticketType.name屬性
        if (normalizeString(ticket.ticketType?.name) === targetType) {
          ticketDetails = ticket;
          console.log(`找到匹配的票券類型: ${ticket.ticketType.name}`);
          break;
        }
        
        // 嘗試部分匹配
        if (normalizeString(ticket.name)?.includes(targetType) || 
            normalizeString(ticketType)?.includes(normalizeString(ticket.name))) {
          ticketDetails = ticket;
          console.log(`找到部分匹配的票券: ${ticket.name}`);
          break;
        }
        
        // 嘗試匹配票券類型關鍵詞
        if (targetType.includes('vip') && 
            (normalizeString(ticket.name).includes('vip') || 
             ticket.price > 1500)) { // 假設VIP票價格較高
          ticketDetails = ticket;
          console.log(`基於關鍵詞和價格匹配VIP票券: ${ticket.name}`);
          break;
        }
        
        if (targetType.includes('標準') && 
            (normalizeString(ticket.name).includes('標準') || 
             ticket.name?.includes('一般') || 
             (ticket.price < 1500 && ticket.price > 500))) {
          ticketDetails = ticket;
          console.log(`基於關鍵詞和價格匹配標準票券: ${ticket.name}`);
          break;
        }
      }

      // A假如仍然沒找到，使用第一個可用票券
      if (!ticketDetails && tickets.length > 0) {
        console.log(`未找到匹配的 ${ticketType} 票券，使用第一個可用票券: ${tickets[0].name || tickets[0].ticketType?.name}`);
        ticketDetails = tickets[0];
      }
      
      // 票券未找到的情況
      if (!ticketDetails) {
        console.error(`未找到任何票券，請檢查API回應`);
        return null;
      }

      // 更健壯的數據提取邏輯
      const ticketName = ticketDetails.name || ticketDetails.ticketType?.name || ticketType || "一般票";
      const ticketDescription = ticketDetails.description || ticketDetails.ticketType?.description || "";
      const ticketPrice = ticketDetails.price || ticketDetails.ticketType?.price || 1000;
      const ticketColorCode = ticketDetails.colorCode || ticketDetails.ticketType?.colorCode || "#4f46e5";
      const ticketQuantity = ticketDetails.availableQuantity || 50;
      
      // 紀錄匹配結果
      console.log(`票券匹配結果: 請求類型=${ticketType}, 實際類型=${ticketName}, 價格=${ticketPrice}`);

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
      console.log("嘗試使用模擬數據作為後備方案");
      
      // 返回VIP票的模擬數據作為後備方案
      if (ticketType && ticketType.toLowerCase().includes('vip')) {
        return {
          id: 1,
          type: 'VIP票',
          price: 2000,
          description: '前排最佳視聽位置，附贈節目冊',
          availableQuantity: 50,
          available: true,
          colorCode: '#4f46e5',
          concert: {
            id: concertId,
            title: '貝多芬鋼琴協奏曲全集',
            description: '享譽國際的鋼琴大師帶來貝多芬鋼琴協奏曲全集',
            posterUrl: '/images/concerts/beethoven-piano.jpg'
          },
          performance: {
            id: 1,
            startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            venue: '數位音樂廳主廳',
            status: 'scheduled'
          }
        };
      } else {
        return {
          id: 2,
          type: '標準票',
          price: 1000,
          description: '標準座位區，良好視聽體驗',
          availableQuantity: 100,
          available: true,
          colorCode: '#22c55e',
          concert: {
            id: concertId,
            title: '貝多芬鋼琴協奏曲全集',
            description: '享譽國際的鋼琴大師帶來貝多芬鋼琴協奏曲全集',
            posterUrl: '/images/concerts/beethoven-piano.jpg'
          },
          performance: {
            id: 1,
            startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            venue: '數位音樂廳主廳',
            status: 'scheduled'
          }
        };
      }
    }
  },
};

export default concertService;
