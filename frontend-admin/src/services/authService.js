import axios from "axios";
import {
  clearAuthState,
  saveAuthState,
  isAuthValid,
} from "../utils/authPersistUtils";

// 建立 axios 實例
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080"; // 修改預設端口
const API_BASE = API_URL;

// 打印環境變量和 API URL (可選，保留用於調試)
// console.log("Environment variables:", {
//   REACT_APP_API_URL: process.env.REACT_APP_API_URL,
//   API_URL: API_URL,
//   API_BASE: API_BASE,
// });

// 修復跨頁面導航時令牌丟失問題
const setupAxiosDefaults = () => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    // console.log(
    //   "設置全局默認Authorization頭部:",
    //   adminToken.substring(0, 10) + "..."
    // );
    axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
  }
};

// 頁面加載時立即設置默認Authorization頭部
setupAxiosDefaults();

// 創建一個 axios 實例用於 API 請求
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 設置超時時間
});

// 創建一個用於根路徑的 axios 實例 (如果需要)
const axiosRootInstance = axios.create({
  baseURL: API_URL, // 或者只是 '/'
  timeout: 5000,
});

// 請求攔截器：在每個請求發送前添加認證令牌
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // console.log("請求攔截器: 添加了 Authorization 頭部", config.url);
    } else {
      // console.log(
      //   "請求攔截器: 未找到令牌，未添加 Authorization 頭部",
      //   config.url
      // );
    }
    return config;
  },
  (error) => {
    console.error("請求攔截器錯誤:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器：處理全局錯誤，特別是 401 未授權
axiosInstance.interceptors.response.use(
  (response) => {
    // 對成功的響應不做任何處理
    return response;
  },
  (error) => {
    console.error(
      "API 響應錯誤:",
      error.response ? error.response.status : error.message,
      "請求 URL:",
      error.config.url
    );

    // 處理 401 未授權錯誤
    if (error.response && error.response.status === 401) {
      console.log("偵測到 401 未授權錯誤");

      // 檢查是否是登入請求本身失敗 (例如密碼錯誤)
      if (error.config.url && error.config.url.includes("/api/auth/admin/signin")) { // Adjusted path
        console.log("登入請求失敗 (401)，可能是憑證錯誤。");
        // 直接返回拒絕的 Promise，讓登入邏輯處理錯誤提示
        return Promise.reject(error);
      }

      // 對於其他請求的 401 錯誤，執行登出邏輯
      console.log("非登入請求的 401 錯誤，執行登出。");
      logout(); // 調用登出函數清除本地狀態

      // 重定向到登入頁面
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/auth/login")) {
        console.log("重定向到 /auth/login");
        window.location.href = "/auth/login"; // 使用 window.location 進行重定向
      } else {
        // console.log("已在登入頁面，不執行重定向");
      }
    }
    // 對於非 401 錯誤，正常返回拒絕的 Promise
    return Promise.reject(error);
  }
);

// 登出函數
const logout = () => {
  // console.log("AuthService: 執行登出操作");
  clearAuthState(); // 使用工具函數清除狀態
  // 注意：這裡不應該再調用 API，因為令牌可能已失效或被清除
};

// 定義 AuthService
const AuthService = {
  login: async (username, password) => {
    try {
      // console.log("AuthService: 嘗試登入", { username });
      const response = await axiosInstance.post("/api/auth/admin/signin", { // Adjusted path
        username,
        password,
      });

      if (response.data && response.data.accessToken) {
        // console.log("AuthService: 登入成功，收到令牌");
        saveAuthState(response.data.accessToken, response.data); // 保存令牌和用戶數據
        return { success: true, data: response.data };
      } else {
        console.error("AuthService: 登入響應無效", response.data);
        return { success: false, message: "登入失敗，響應數據無效" };
      }
    } catch (error) {
      console.error(
        "AuthService: 登入請求失敗",
        error.response ? error.response.data : error.message
      );
      // 攔截器會處理 401，這裡主要處理其他錯誤或提供更具體的錯誤訊息
      const message =
        error.response?.data?.message ||
        error.message ||
        "登入失敗，請檢查您的憑證";
      return { success: false, message };
    }
  },

  getCurrentAdmin: () => {
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("解析存儲的用戶數據失敗:", e);
        return null;
      }
    }
    return null;
  },

  isAdminAuthenticated: () => {
    return isAuthValid(); // 直接使用工具函數判斷
  },

  logout, // 導出 logout 函數
  axiosInstance, // 導出 axios 實例供 AuthContext 使用
  axiosRootInstance, // 導出根路徑實例 (如果其他地方需要)
};

export default AuthService;
