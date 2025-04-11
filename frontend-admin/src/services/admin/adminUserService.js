import axios from 'axios';
import AuthService from '../authService';

// API 基礎 URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
  
  // 確保角色列表正確設置
  if (!adminData.role || !Array.isArray(adminData.role) || adminData.role.length === 0) {
    adminData.role = ['admin'];
    console.log('已自動設置角色為 admin');
  }
  
  // 嘗試通過多種可能的路徑格式發送請求
  const possibleEndpoints = [
    '/api/auth/register-admin',
    '/auth/register-admin',
    '/api/setup/first-admin',
    '/api/auth/register'
  ];
  
  console.log('要發送的管理員資料:', { ...adminData, password: '[REDACTED]' });
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`嘗試使用端點: ${endpoint}`);
      const response = await baseAxiosInstance.post(endpoint, adminData);
      console.log(`使用 ${endpoint} 成功:`, response);
      return response;
    } catch (error) {
      console.error(`使用 ${endpoint} 失敗:`, error.response ? {status: error.response.status, data: error.response.data} : error.message);
    }
  }
  
  // 如果所有嘗試都失敗，拋出錯誤
  throw new Error('所有註冊嘗試都失敗了');
};

// 獲取所有管理員帳號 - 需要認證
const getAllAdmins = () => {
  return axiosInstance.get('/admin/users');
};

// 修改管理員帳號狀態 - 需要認證
const updateAdminStatus = (id, status) => {
  return axiosInstance.patch(`/admin/users/${id}/status?status=${status}`);
};

// 刪除管理員帳號 - 需要認證
const deleteAdmin = (id) => {
  return axiosInstance.delete(`/admin/users/${id}`);
};

const AdminUserService = {
  createAdmin,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin
};

export default AdminUserService;