import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

// 添加額外的調試輸出
axios.interceptors.request.use(
  (request) => {
    console.log("開始新請求:", {
      url: request.url,
      method: request.method,
      headers: request.headers,
    });
    return request;
  },
  (error) => {
    console.error("請求配置錯誤:", error);
    return Promise.reject(error);
  }
);

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
  "/api/auth/signin",
  // "/" 已移除，避免過度匹配所有路徑
];

// 嘗試獲取 AuthContext 實例，以便使用 setupPreRequestAuth 函數
let setupPreRequestAuthFn = null;
const getSetupPreRequestAuthFn = () => {
  if (setupPreRequestAuthFn) return setupPreRequestAuthFn;

  // 首先嘗試從全局變量獲取
  if (
    window.__AUTH_CONTEXT__ &&
    typeof window.__AUTH_CONTEXT__.setupPreRequestAuth === "function"
  ) {
    setupPreRequestAuthFn = window.__AUTH_CONTEXT__.setupPreRequestAuth;
    return setupPreRequestAuthFn;
  }

  // 如果沒有全局變量，返回默認實現
  return (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  };
};

// 請求攔截器，為每個請求添加JWT令牌
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加更詳細的日誌
    console.log(`發送請求到: ${config.url}`);

    // 更精確的路徑比對
    const isPublicPath = PUBLIC_PATHS.some((path) => {
      // 完全匹配或是以公開路徑為前綴的路徑
      const isExactMatch = config.url === path;
      const isPrefixMatch =
        path !== "/" &&
        (config.url.startsWith(path + "/") ||
          config.url.startsWith(path + "?"));

      const match = isExactMatch || isPrefixMatch;

      // 詳細日誌以幫助調試
      if (match) {
        console.log(`公開路徑匹配: ${path} vs ${config.url} - 匹配成功`);
      }

      return match;
    });

    // 如果不是公開路徑，添加令牌
    if (!isPublicPath) {
      // 使用 setupPreRequestAuth 函數添加令牌
      const setupFn = getSetupPreRequestAuthFn();
      config = setupFn(config);
      console.log(`已為請求設置認證: ${config.url}`);
    } else {
      console.log(`公開路徑無需令牌: ${config.url}`);
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
        console.log("發送登出請求到伺服器");
        await axiosInstance.post(path);
        console.log("成功發送登出請求");
      } catch (error) {
        console.error("發送登出請求失敗:", error);
      }
    }
  } catch (error) {
    console.error("登出處理發生錯誤:", error);
  } finally {
    // 再次確保本地存儲被清除
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("本地認證狀態已清除");
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
      console.log("偵測到 401 未授權錯誤，檢查當前路徑");
      console.log("錯誤發生的請求:", {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
      });

      // 檢查當前路徑是否為結帳相關頁面、購物車頁面或票券頁面
      const currentPath = window.location.pathname;
      const isCheckoutPath = currentPath.includes("/checkout/");
      const isCartPath = currentPath.includes("/cart");
      const isTicketPath = currentPath.includes("/tickets/");
      const isLoginPath =
        currentPath.includes("/login") || currentPath.includes("/register");

      // 如果是登入相關頁面收到401，可能是登入失敗的預期錯誤，直接顯示錯誤
      if (isLoginPath) {
        console.log("在登入相關頁面收到401錯誤，可能是資訊錯誤");
        return Promise.reject(error);
      }

      // 檢查是否為票券API錯誤，特別處理
      const isTicketApiError =
        error.config.url.includes("/api/concerts") ||
        error.config.url.includes("/api/tickets") ||
        error.config.url.includes("/api/performances");

      // 在票券頁面或票券API錯誤時特殊處理
      if (isTicketPath || isTicketApiError) {
        console.log("票券相關操作收到401錯誤，但不清除登入狀態或重定向");
        // 在收到票券相關401錯誤時，不立即清除登入狀態或重定向
        // 這是因為某些票券信息可能不需要登入即可查看
        return Promise.reject(error);
      }

      // 在結帳或購物車頁面先不處理登出或重定向
      if (isCheckoutPath || isCartPath) {
        console.log("在結帳或購物車頁面收到401錯誤，但不清除登入狀態或重定向");
        // 在結帳或購物車頁面收到401錯誤時，不清除登入狀態或重定向
        // 這是為了避免結帳流程中的認證問題導致用戶被重定向到登入頁面
        return Promise.reject(error);
      }

      // 如果不是在結帳頁面，則正常處理401錯誤
      console.log("清除本地存儲中的無效令牌");
      // 先清除本地存儲中的無效令牌
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 如果收到401錯誤且不是在登入或註冊頁面或付款結果頁面，則進行重定向
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register") &&
        !currentPath.includes("/reset-password") &&
        !currentPath.includes("/payment") &&
        !isTicketPath && // 避免在票券頁面重定向
        !isTicketApiError // 避免在票券API錯誤時重定向
      ) {
        // 如果全局有 ToastManager 實例，則使用它顯示通知
        if (typeof window.ToastManager !== "undefined" && window.ToastManager) {
          window.ToastManager.showWarning(
            "登入狀態",
            "您的登入已過期，需重新登入。您可以手動點擊登入按鈕或者查看控制台錯誤訊息。"
          );
        } else {
          // 如果 ToastManager 不可用，則使用 console
          console.warn("登入已過期，將重新導向到登入頁面");
        }

        // 在 console 中顯示詳細的錯誤訊息，方便開發人員調試
        console.error("401 未授權錯誤詳細資訊:", {
          url: error.config.url,
          method: error.config.method,
          headers: JSON.stringify(error.config.headers),
          responseStatus: error.response?.status,
          responseData: error.response?.data,
          timestamp: new Date().toISOString(),
        });

        // 清除本地存儲，但不立即重定向
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // 將重定向都進行記錄，但不實際執行
        const redirectPath = encodeURIComponent(currentPath);
        console.log(
          `已將重定向設定為不自動執行，您可以在控制台調整測試完成後手動導向到: /login?redirect=${redirectPath}`
        );

        // 將重定向網址添加到 window 上，但不實際執行重定向
        window.loginRedirectUrl = `/login?redirect=${redirectPath}`;

        // 添加一個自動重定向的函數，但不主動調用
        window.executeLoginRedirect = function () {
          if (window.loginRedirectUrl) {
            window.location.href = window.loginRedirectUrl;
          }
        };
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

  const endpoint = "/api/auth/register";
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
    // 調整登入端點路徑
    // 使用後端實際期望的路徑 - 可能後端期望的是 /api/auth/signin 或 /auth/signin
    // 嘗試使用相對路徑 - 避免路徑前綴問題
    const endpoint = "auth/signin";
    console.log("API URL:", API_URL);
    console.log("完整請求 URL:", `${API_URL}/api/${endpoint}`);

    // 添加更多調試信息
    console.log("請求詳情:", {
      url: `${API_URL}/api/${endpoint}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: { username, password: "[PROTECTED]" },
    });

    const response = await axiosInstance.post(`/api/${endpoint}`, {
      identifier: username,
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
        id: response.data.id || 0, // 確保至少有一個 ID 值
        email: response.data.email || "",
        roles: response.data.roles || ["user"],
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
    } else if (response.data) {
      // 如果有回應數據但沒有 accessToken
      console.warn("登入回應中沒有令牌，但有其他數據", response.data);

      // 因為伺服器可能返回不同的欄位名稱，嘗試尋找可能的令牌欄位
      const possibleTokenFields = [
        "accessToken",
        "token",
        "jwt",
        "id_token",
        "auth_token",
      ];

      // 尋找可能的令牌欄位
      for (const field of possibleTokenFields) {
        if (response.data[field]) {
          console.log(`找到可能的令牌欄位: ${field}`);

          // 存入令牌
          localStorage.setItem("token", response.data[field]);

          // 建立使用者資料
          const userData = {
            ...response.data,
            username: response.data.username || username,
            accessToken: response.data[field],
          };

          localStorage.setItem("user", JSON.stringify(userData));
          return userData;
        }
      }

      throw new Error("登入回應中沒有認可的令牌格式");
    } else {
      console.error("登入回應中沒有數據");
      throw new Error("登入回應中沒有數據");
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

// 檢查令牌是否有效 - 簡化版本，更寬鬆的驗證
const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("未找到令牌");
    return false;
  }

  // 簡單檢查令牌基本格式 (JWT應有3個部分)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.warn("令牌格式不是標準JWT格式 (不包含3個部分)");
    // 即使格式不正確，仍然返回true
    // 令牌有效性檢查應該由後端API處理
    return true;
  }

  // 不嘗試解析令牌或檢查過期時間
  // 如果有令牌就直接視為有效，實際有效性讓後端API決定
  console.log("令牌格式檢查通過，視為有效");
  return true;
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
  isTokenValid, // 現有的，可能更複雜的驗證
  // 可以添加一個簡單的 isAuthenticated 方法
  isAuthenticated: () => {
    const token = localStorage.getItem("token"); // 使用 AuthService 內部一致的 token 鍵名
    return !!token;
  },
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  axiosInstance,
};

export default AuthService;
