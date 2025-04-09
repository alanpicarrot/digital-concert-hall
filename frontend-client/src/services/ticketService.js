import authService from './authService';
import axios from 'axios';
import { validateApiPath } from '../utils/apiUtils';

const API_USER_TICKETS_PATH = '/api/users/me/tickets';
const API_PUBLIC_TICKETS_PATH = '/api/tickets';
const API_PERFORMANCES_PATH = '/api/performances';
const { axiosInstance } = authService;

// 創建一個公共 axios 實例，無需授權，用於獲取公開的票券數據
const publicAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 獲取用戶所有票券（分頁）
const getUserTickets = async (page = 0, size = 10) => {
  try {
    const path = validateApiPath(`${API_USER_TICKETS_PATH}?page=${page}&size=${size}`);
    console.log(`獲取用戶票券，請求路徑: ${path}`);
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error.response ? error.response.status : error.message);
    throw error;
  }
};

// 獲取用戶特定票券詳情（包含QR碼）
const getTicketDetail = async (ticketId) => {
  try {
    const path = validateApiPath(`${API_USER_TICKETS_PATH}/${ticketId}`);
    const response = await axiosInstance.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket detail:', error);
    throw error;
  }
};

// 獲取所有可購買票券（無需登入）
const getAllAvailableTickets = async () => {
  try {
    const path = validateApiPath(`${API_PUBLIC_TICKETS_PATH}/available`);
    const response = await publicAxios.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching available tickets:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬票券數據');
    
    // 確保活動頁面、票券頁面和購票頁面的數據一致
    const mockAvailableTickets = [
      {
        id: 1,
        concertId: 1,
        concertTitle: '貝多芬交響曲全集',
        ticketType: {
          id: 1,
          name: 'VIP票',
          description: '前排最佳視聽位置，附賞節目冊',
          price: 2000
        },
        price: 2000,
        availableQuantity: 50,
        performance: {
          id: 1,
          startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          venue: '數位音樂廳主廳',
          concertId: 1
        }
      },
      {
        id: 2,
        concertId: 1,
        concertTitle: '貝多芬交響曲全集',
        ticketType: {
          id: 2,
          name: '標準票',
          description: '標準座位區，良好視聽體驗',
          price: 1000
        },
        price: 1000,
        availableQuantity: 100,
        performance: {
          id: 1,
          startTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          venue: '數位音樂廳主廳',
          concertId: 1
        }
      },
      {
        id: 3,
        concertId: 2,
        concertTitle: '莫札特歌劇選粹',
        ticketType: {
          id: 1,
          name: 'VIP票',
          description: '前排最佳視聽位置，附賞節目冊',
          price: 2000
        },
        price: 2000,
        availableQuantity: 30,
        performance: {
          id: 2,
          startTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          venue: '數位音樂廳小廳',
          concertId: 2
        }
      },
      {
        id: 4,
        concertId: 2,
        concertTitle: '莫札特歌劇選粹',
        ticketType: {
          id: 2,
          name: '標準票',
          description: '標準座位區，良好視聽體驗',
          price: 1000
        },
        price: 1000,
        availableQuantity: 80,
        performance: {
          id: 2,
          startTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          venue: '數位音樂廳小廳',
          concertId: 2
        }
      }
    ];
    
    return mockAvailableTickets;
  }
};

// 根據ID獲取特定票券詳情（無需登入）
const getTicketById = async (ticketId) => {
  try {
    const path = validateApiPath(`${API_PUBLIC_TICKETS_PATH}/${ticketId}`);
    const response = await publicAxios.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬票券數據');
    
    // 這裡可以根據測試數據中記錄的票種，提供模擬數據
    const mockTicket = {
      id: ticketId,
      ticketType: {
        id: 1,
        name: ticketId % 2 === 0 ? 'VIP票' : '標準票',
        description: ticketId % 2 === 0 ? 
          '前排最佳視聽位置，附贈節目冊' : 
          '標準座位區，良好視聽體驗',
        price: ticketId % 2 === 0 ? 2000 : 1000,
        colorCode: ticketId % 2 === 0 ? '#4f46e5' : '#22c55e'
      },
      price: ticketId % 2 === 0 ? 2000 : 1000,
      availableQuantity: 50,
      performance: {
        id: 1,
        startTime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        endTime: new Date(new Date().setDate(new Date().getDate() + 7) + 7200000).toISOString(),
        venue: '數位音樂廳主廳',
        concertId: 1
      }
    };
    
    return mockTicket;
  }
};

// 根據演出場次ID獲取可用票券
const getTicketsByPerformance = async (performanceId) => {
  try {
    const path = validateApiPath(`${API_PERFORMANCES_PATH}/${performanceId}/tickets`);
    const response = await publicAxios.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets by performance:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬演出場次票券數據');
    
    // 為演出場次提供兩種票券類型的模擬數據
    const mockTickets = [
      {
        id: 1,
        ticketType: {
          id: 1,
          name: 'VIP票',
          description: '前排最佳視聽位置，附贈節目冊',
          price: 2000,
          colorCode: '#4f46e5'
        },
        price: 2000,
        availableQuantity: 100,
        performance: {
          id: performanceId,
          startTime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          endTime: new Date(new Date().setDate(new Date().getDate() + 7) + 7200000).toISOString(),
          venue: '數位音樂廳主廳',
          concertId: 1
        }
      },
      {
        id: 2,
        ticketType: {
          id: 2,
          name: '標準票',
          description: '標準座位區，良好視聽體驗',
          price: 1000,
          colorCode: '#22c55e'
        },
        price: 1000,
        availableQuantity: 200,
        performance: {
          id: performanceId,
          startTime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          endTime: new Date(new Date().setDate(new Date().getDate() + 7) + 7200000).toISOString(),
          venue: '數位音樂廳主廳',
          concertId: 1
        }
      }
    ];
    
    return mockTickets;
  }
};

// 獲取演出場次詳情
const getPerformanceById = async (performanceId) => {
  try {
    const path = validateApiPath(`${API_PERFORMANCES_PATH}/${performanceId}`);
    const response = await publicAxios.get(path);
    return response.data;
  } catch (error) {
    console.error('Error fetching performance by ID:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬演出場次數據');
    
    const mockPerformance = {
      id: performanceId,
      startTime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      endTime: new Date(new Date().setDate(new Date().getDate() + 7) + 7200000).toISOString(),
      venue: '數位音樂廳主廳',
      status: 'scheduled',
      concertId: 1
    };
    
    return mockPerformance;
  }
};

const TicketService = {
  getUserTickets,
  getTicketDetail,
  getAllAvailableTickets,
  getTicketById,
  getTicketsByPerformance,
  getPerformanceById
};

export default TicketService;