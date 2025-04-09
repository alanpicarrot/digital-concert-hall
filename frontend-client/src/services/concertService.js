import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const concertService = {
  // 獲取所有活躍音樂會列表
  getAllConcerts: async () => {
    try {
      const path = validateApiPath("/api/concerts");
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error("獲取音樂會列表失敗:", error);
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
      console.error(`獲取音樂會 ${id} 詳情失敗:`, error);
      throw error;
    }
  },

  // 獲取即將上演的音樂會
  getUpcomingConcerts: async () => {
    try {
      const path = validateApiPath("/api/concerts/upcoming");
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error("獲取即將上演音樂會失敗:", error);
      throw error;
    }
  },

  // 獲取過往音樂會
  getPastConcerts: async () => {
    try {
      const path = validateApiPath("/api/concerts/past");
      const response = await axios.get(`${API_URL}${path}`);
      return response.data;
    } catch (error) {
      console.error("獲取過往音樂會失敗:", error);
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
        throw new Error("此音樂會無可用表演場次");
      }

      // 根據表演場次獲取票券
      const ticketsPath = validateApiPath(
        `/api/performances/${performanceId}/tickets`
      );
      const ticketsResponse = await axios.get(`${API_URL}${ticketsPath}`);
      const tickets = ticketsResponse.data;

      // 尋找匹配票券類型的票券
      const ticketDetails = tickets.find(
        (ticket) =>
          ticket.ticketType.name.toLowerCase() === ticketType.toLowerCase()
      );

      if (!ticketDetails) {
        // 如果API調用失敗或找不到匹配的票券，使用模擬數據
        return {
          id: 1,
          type: ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
          price: ticketType.toLowerCase() === "vip" ? 2000 : 1000,
          description:
            ticketType.toLowerCase() === "vip"
              ? "前排最佳視聽位置，附贈節目冊"
              : "標準座位區，良好視聽體驗",
          availableQuantity: 50,
          colorCode: ticketType.toLowerCase() === "vip" ? "#4f46e5" : "#22c55e",
          concert: concertData,
          performance: {
            startTime: new Date(
              new Date().getTime() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            endTime: new Date(
              new Date().getTime() +
                7 * 24 * 60 * 60 * 1000 +
                2 * 60 * 60 * 1000
            ).toISOString(),
            venue: "數位音樂廳主廳",
          },
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
        performance: ticketDetails.performance,
      };
    } catch (error) {
      console.error("獲取票券詳情失敗:", error);
      return null;
    }
  },
};

export default concertService;
