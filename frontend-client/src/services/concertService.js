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
    console.error("Concert API Error:", error.config?.url, error.message);
    return Promise.reject(error);
  }
);

const concertService = {
  getAllConcerts: async () => {
    try {
      console.debug("Fetching all concerts...");
      const path = validateApiPath("/api/concerts");
      const response = await publicAxios.get(path);
      console.debug("Concerts fetched successfully:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("獲取音樂會列表失敗:", error.message);
      return [];
    }
  },

  // 模擬數據 - 用於前端開發測試時的備用數據
  _getMockConcerts: () => {
    return {
      '1': {
        id: 1,
        title: "2025春季交響音樂會",
        description: "春季音樂盛宴，將為您帶來優美的音樂體驗。由著名指揮家帶領交響樂團，演奏經典曲目和當代作品。",
        programDetails: "貓與老鼠 - 幻想之舞\n柴可夫斯基 - 第五交響曲\n德布西 - 月光\n莫札特 - 小星星變奏曲",
        posterUrl: "/assets/images/concert-posters/spring-concert.jpg",
        status: "active",
        performances: [
          {
            id: 101,
            startTime: "2025-05-15T19:30:00",
            endTime: "2025-05-15T21:30:00",
            venue: "數位音樂廳主廳",
            status: "scheduled"
          }
        ]
      },
      '2': {
        id: 2,
        title: "貝多芬鋼琴妙境音樂會",
        description: "一場精彩的貝多芬鋼琴演出，展現音樂的深邃與優雅",
        programDetails: "第一部分: 月光奏鳴曲\n第二部分: 悲壯英雄\n第三部分: 田園交響曲",
        posterUrl: "/assets/images/concert-posters/beethoven.jpg",
        status: "active",
        performances: [
          {
            id: 201,
            startTime: "2025-06-20T19:00:00",
            endTime: "2025-06-20T21:00:00",
            venue: "數位音樂廳主廳",
            status: "scheduled"
          }
        ]
      }
    };
  },

  getConcertById: async (id) => {
    if (!id) {
      throw new Error("Concert ID is required");
    }

    try {
      const path = validateApiPath(`/api/concerts/${id}`);
      console.log(`獲取音樂會詳情: ${path}`);
      const response = await publicAxios.get(path);
      console.log(`音樂會數據回應:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`獲取音樂會 ${id} 詳情失敗:`, error);
      
      // 嘗試創建測試數據
      try {
        console.log('嘗試創建測試數據...');
        await fetch('http://localhost:8080/api/concerts/create-spring-concert');
      } catch (createError) {
        console.error('創建測試數據失敗:', createError);
      }
      
      // 如果 API 應答失敗，則使用模擬數據
      const mockConcerts = concertService._getMockConcerts();
      if (mockConcerts[id]) {
        console.log(`使用模擬數據用於音樂會ID ${id}`);
        return mockConcerts[id];
      }
      
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getUpcomingConcerts: async () => {
    const path = validateApiPath("/api/concerts/upcoming");
    const response = await publicAxios.get(path);
    return response.data;
  },

  getPastConcerts: async () => {
    const path = validateApiPath("/api/concerts/past");
    const response = await publicAxios.get(path);
    return response.data;
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
