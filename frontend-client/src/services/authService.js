import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_PATHS = [
  "/concerts",
  "/api/concerts",
  "/api/concerts/upcoming",
  "/api/concerts/past",
  "/", // Add root path
];

// 請求攔截器，為每個請求添加JWT令牌
axiosInstance.interceptors.request.use(
  (config) => {
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      config.url?.includes(path)
    );
    if (isPublicPath) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 登出函數
const logout = async () => {
  try {
    // 先清除本地存儲
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // 嘗試發送登出請求到伺服器
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const path = validateApiPath("/logout");
        console.log('發送登出請求到伺服器');
        await axiosInstance.post(path);
        console.log('成功發送登出請求');
      } catch (error) {
        console.error("發送登出請求失敗:", error);
      }
    }
  } catch (error) {
    console.error('登出處理發生錯誤:', error);
  } finally {
    // 再次確保本地存儲被清除
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log('本地認證狀態已清除');
  }
};

// 響應攔截器，處理常見錯誤（如401未授權）
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API 錯誤:",
      error.response ? error.response.status : error.message
    );

    // 處理 401 未授權錯誤 (令牌過期或無效)
    if (error.response && error.response.status === 401) {
      console.log("偵測到 401 未授權錯誤，清除登入狀態");

      // 先清除本地存儲中的無效令牌
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 如果收到401錯誤且不是在登入或註冊頁面或付款結果頁面，則進行重定向
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register") &&
        !currentPath.includes("/reset-password") &&
        !currentPath.includes("/payment")
      ) {
        // 顯示通知
        alert("您的登入已過期，請重新登入");

        // 保存當前頁面路徑用於登入後重定向
        const redirectPath = encodeURIComponent(currentPath);

        // 重定向到登入頁面，並帶上當前頁面作為重定向參數
        console.log(`重定向到登入頁面，幫訂重定向到: ${redirectPath}`);
        window.location.href = `/login?redirect=${redirectPath}`;
      }
    }
    return Promise.reject(error);
  }
);

// 註冊函數
const register = async (username, email, password, firstName, lastName) => {
  // 創建要發送的數據
  const requestData = {
    username: username || "",
    email: email || "",
    password: password || "",
    firstName: firstName || "",
    lastName: lastName || "",
    role: ["user"],
  };

  // 輸出完整的請求數據（密碼除外）
  console.log("Sending register request with data:", {
    ...requestData,
    password: "[REDACTED]",
  });

  // 使用validateApiPath確保路徑一致性，包含 /auth 路徑
  const endpoint = validateApiPath("/register");
  console.log("API URL:", API_URL);
  console.log("完整請求 URL:", `${API_URL}${endpoint}`);

  return axiosInstance.post(endpoint, requestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 改進的登入函數
const login = async (username, password) => {
  console.log("登入流程啟動 - 清除舊資料");
  // 先清除舊的登入狀態，避免混合
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  console.log("發送登入請求:", { username, password: "******" });

  try {
    // 使用validateApiPath確保路徑一致性，包含 /auth 路徑
    const endpoint = validateApiPath("/signin");
    console.log("API URL:", API_URL);
    console.log("完整請求 URL:", `${API_URL}${endpoint}`);

    const response = await axiosInstance.post(endpoint, {
      username,
      password,
    });

    console.log("登入請求成功:", response.status, response.statusText);
    console.log("登入回應資料:", response.data);

    // 檢查回應中的 token
    if (response.data && response.data.accessToken) {
      console.log("成功收到令牌，存入 localStorage");

      // 存入令牌
      localStorage.setItem("token", response.data.accessToken);

      // 確保用戶資料完整
      const userData = {
        ...response.data,
        username: response.data.username || username,
        id: response.data.id,
        email: response.data.email,
        roles: response.data.roles,
        accessToken: response.data.accessToken,
      };

      console.log("寫入的用戶數據：", userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // 偵測 localStorage 是否成功存入
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      console.log("存入後的檢查:", {
        token: savedToken ? "已設置" : "未設置",
        user: savedUser ? "已設置" : "未設置",
        userData: savedUser ? JSON.parse(savedUser) : null,
      });

      return userData;
    } else {
      console.error("登入回應中沒有令牌:", response.data);
      throw new Error("登入回應中沒有令牌");
    }
  } catch (error) {
    console.error("登入錯誤:", error.message);
    if (error.response) {
      console.error("錯誤資料:", error.response.data);
      console.error("錯誤狀態:", error.response.status);
    }
    throw error;
  }
};

// 獲取當前用戶信息
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const user = JSON.parse(userStr);
    return { ...user, accessToken: token };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// 檢查令牌是否有效
const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  // 檢查令牌格式
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.error("令牌格式不正確");
    return false;
  }

  try {
    // 解析JWT的有效期
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // 檢查令牌是否過期
    if (payload.exp && payload.exp < currentTime) {
      console.log("令牌已過期", {
        exp: payload.exp,
        now: currentTime,
        diff: currentTime - payload.exp,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("驗證令牌時出錯:", error);
    return false;
  }
};

// 重設密碼請求
const forgotPassword = (email) => {
  // 確保使用 /api/auth 路徑
  const endpoint = validateApiPath("/forgot-password");
  console.log("忘記密碼請求 URL:", `${API_URL}${endpoint}`);
  return axiosInstance.post(endpoint, { email });
};

// 重設密碼
const resetPassword = (token, password) => {
  // 確保使用 /api/auth 路徑
  const endpoint = validateApiPath("/reset-password");
  console.log("重設密碼請求 URL:", `${API_URL}${endpoint}`);
  return axiosInstance.post(endpoint, { token, password });
};

// 更新用戶信息
const updateProfile = (userData) => {
  const endpoint = validateApiPath("/users/me");
  console.log("更新用戶信息請求 URL:", `${API_URL}${endpoint}`);
  return axiosInstance.put(endpoint, userData);
};

// 更新密碼
const updatePassword = (currentPassword, newPassword) => {
  const endpoint = validateApiPath("/users/me/password");
  console.log("更新密碼請求 URL:", `${API_URL}${endpoint}`);
  return axiosInstance.put(endpoint, {
    currentPassword,
    newPassword,
  });
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  isTokenValid,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  axiosInstance,
};

export default AuthService;
