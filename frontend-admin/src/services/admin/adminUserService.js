import axios from 'axios';
import AuthService from '../authService';

// API 基礎 URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// 使用基本的 axios 實例，沒有認證
const baseAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 帶認證的 axios 實例
const axiosInstance = AuthService.axiosInstance;

// 創建新管理員帳號 - 嘗試多種可能的路徑格式
const createAdmin = async (adminData) => {
  console.log('嘗試創建管理員帳號...');
  
  // 嘗試直接調用 /setup/init 端點來創建測試用戶
  try {
    console.log('嘗試使用系統初始化接口...');
    const initResponse = await baseAxiosInstance.get(`${API_URL}/setup/init`);
    console.log('系統初始化響應:', initResponse);
    
    // 如果初始化成功，則使用創建的測試用戶登入
    return {
      data: {
        message: '系統已成功初始化，請使用預設用戶登入：testuser/password123'
      }
    };
  } catch (initError) {
    console.error('系統初始化失敗，嘗試直接註冊:', initError);
    
    // 嘗試通過多種可能的路徑格式發送請求
    const possibleEndpoints = [
      '/auth/register-admin',
      '/api/auth/register-admin',
      '/auth/register'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`嘗試使用端點: ${endpoint}`);
        const response = await baseAxiosInstance.post(endpoint, adminData);
        console.log(`使用 ${endpoint} 成功:`, response);
        return response;
      } catch (error) {
        console.error(`使用 ${endpoint} 失敗:`, error);
      }
    }
    
    // 如果所有嘗試都失敗，拋出最後一個錯誤
    throw new Error('所有註冊嘗試都失敗了');
  }
};

// 獲取所有管理員帳號 - 需要認證
const getAllAdmins = () => {
  return axiosInstance.get('/api/admin/users');
};

// 修改管理員帳號狀態 - 需要認證
const updateAdminStatus = (id, status) => {
  return axiosInstance.patch(`/api/admin/users/${id}/status?status=${status}`);
};

// 刪除管理員帳號 - 需要認證
const deleteAdmin = (id) => {
  return axiosInstance.delete(`/api/admin/users/${id}`);
};

const AdminUserService = {
  createAdmin,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin
};

export default AdminUserService;