import axios from "axios";
import { validateApiPath } from "../utils/apiUtils";

// 建立 axios 實例
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
// 確保API_BASE是正確的基本URL
const API_BASE = API_URL.endsWith("/") ? API_URL : API_URL + "/";

// 打印環境變量和 API URL
console.log("Environment variables:", {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_URL: API_URL,
  API_BASE: API_BASE,
});

// 手動設置模擬模式，用於調試目的
const FORCE_MOCK_MODE = false; // 將此設置為 true 如果後端確實無法訪問
// 模擬用戶數據
const MOCK_USERS = {
  admin: {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    roles: ["ROLE_ADMIN"],
    accessToken: "mock-jwt-token-for-admin",
  },
  test: {
    id: 2,
    username: "test",
    email: "test@example.com",
    roles: ["ROLE_USER", "ROLE_ADMIN"],
    accessToken: "mock-jwt-token-for-test",
  },
  testuser: {
    id: 3,
    username: "testuser",
    email: "testuser@example.com",
    roles: ["ROLE_USER", "ROLE_ADMIN"],
    accessToken: "mock-jwt-token-for-testuser",
  },
};

// 檢查後端是否可用的標誌
let backendAvailable = false;

// 嘗試檢查後端是否可用
const checkBackendAvailability = async () => {
  // 如果強制模擬模式開啟，直接返回不可用
  if (FORCE_MOCK_MODE) {
    console.log("強制模擬模式啟用，返回後端不可用");
    backendAvailable = false;
    return false;
  }

  try {
    // 嘗試多個可能的健康檢查端點
    const healthEndpoints = [
      `${API_URL}/health`,
      `${API_URL}/api/health`,
      `${API_URL}/ping`,
      `${API_URL}/api/ping`,
    ];

    for (const endpoint of healthEndpoints) {
      try {
        console.log(`嘗試健康檢查端點: ${endpoint}`);
        const response = await axios.get(endpoint, { timeout: 3000 });
        if (response.status === 200) {
          console.log(`健康檢查成功: ${endpoint}`, response.data);
          backendAvailable = true;
          return true;
        }
      } catch (endpointError) {
        console.log(`端點 ${endpoint} 無法訪問`);
        // 繼續嘗試下一個端點
      }
    }

    // 如果所有端點都失敗
    backendAvailable = false;
    console.log("所有健康檢查端點均無法訪問，後端服務不可用");
    return false;
  } catch (error) {
    backendAvailable = false;
    console.log("健康檢查過程出錯，後端服務不可用", error);
    return false;
  }
};

// 初始檢查
checkBackendAvailability();

// 創建兩個 axios 實例
// 1. 帶 /api 前綴的實例用於大部分請求
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 確保攜帶憑證
});

// 確保每次頁面加載時都記錄當前的令牌狀態
const adminToken = localStorage.getItem("adminToken");
console.log("當前令牌狀態:", adminToken ? "令牌存在" : "無令牌");
if (adminToken) {
  console.log("令牌詳情:", adminToken.substring(0, 10) + "...");
}

// 2. 不帶 /api 前綴的實例用於直接訪問
const axiosRootInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 確保攜帶憑證
});

// 登出函數 - 定義在這裡以便可以在下面的攔截器中使用
const logout = () => {
  console.log("執行管理員登出操作");

  // 先記錄現有狀態，方便除錯
  const beforeAdminToken = localStorage.getItem("adminToken");
  const beforeAdminUser = localStorage.getItem("adminUser");
  console.log("登出前狀態:", {
    token: beforeAdminToken ? "存在" : "不存在",
    user: beforeAdminUser ? "存在" : "不存在"
  });

  // 清除本地存儲
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  
  // 二次確認確實清除了登入狀態
  const afterAdminToken = localStorage.getItem("adminToken");
  const afterAdminUser = localStorage.getItem("adminUser");
  console.log("登出後狀態:", {
    token: afterAdminToken ? "存在" : "不存在",
    user: afterAdminUser ? "存在" : "不存在"
  });

  // 確保清除任何測試用戶的痕跡
  if (window.testUserCleared === undefined) {
    window.testUserCleared = true;
    console.log("清除測試用戶狀態");
  }

  // 只在有令牌的情況下才要嘗試調用登出 API
  if (beforeAdminToken) {
    try {
      // 使用主要的登出端點
      const endpoint = validateApiPath("/api/auth/logout");
      
      // 設置請求直接的選項
      const options = {
        headers: {
          "Authorization": `Bearer ${beforeAdminToken}`
        },
        timeout: 2000 // 設置2秒逾時，防止卡住
      };
      
      axiosInstance.post(endpoint, {}, options)
        .then(response => {
          console.log("登出 API 調用成功");
        })
        .catch(err => {
          console.log("登出 API 調用失敗，但本地存儲已清除");
        });
    } catch (error) {
      console.log("登出 API 調用準備時失敗");
    }
  } else {
    console.log("沒有令牌，跳過登出 API 調用");
  }
};

// 請求攔截器，為每個請求添加JWT令牌
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
      console.log("添加授權令牌到請求", config.url);
    } else {
      console.log("請求未包含授權令牌", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 為直接請求的實例也添加請求攔截器
axiosRootInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
      console.log("添加授權令牌到根請求", config.url);
    } else {
      console.log("根請求未包含授權令牌", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      console.log("偵測到 401 未授權錯誤，清除管理員登入狀態");

      // 如果收到401錯誤且不是在登入頁面或註冊頁面，則登出用戶
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/auth/login") &&
        !currentPath.includes("/auth/register-admin")
      ) {
        // 只清除本地存儲，不觸發額外的API呼叫
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        // 顯示通知
        alert("您的登入已過期，請重新登入");

        // 重定向到登入頁面
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// 為直接請求的實例也添加響應攔截器
axiosRootInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API 錯誤 (Root):",
      error.response ? error.response.status : error.message
    );

    // 處理 401 未授權錯誤 (令牌過期或無效)
    if (error.response && error.response.status === 401) {
      console.log("偵測到 401 未授權錯誤，清除管理員登入狀態");

      // 如果收到401錯誤且不是在登入頁面或註冊頁面，則登出用戶
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/auth/login") &&
        !currentPath.includes("/auth/register-admin")
      ) {
        // 只清除本地存儲，不觸發額外的API呼叫
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        // 顯示通知
        alert("您的登入已過期，請重新登入");

        // 重定向到登入頁面
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// 管理員登入函數
const login = async (usernameOrEmail, password) => {
  console.log("Sending admin login request with:", {
    usernameOrEmail,
    password: "[REDACTED]",
  });

  // 先清除任何舊令牌和用戶數據
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  // 嘗試檢查後端是否可用
  const isBackendAvailable = await checkBackendAvailability();
  
  // 根據後端可用性決定是否使用模擬模式
  const useMockMode = !isBackendAvailable || FORCE_MOCK_MODE;
  console.log("登入操作正在" + (useMockMode ? "模擬" : "實際") + "狀態下進行");

  // 使用模擬模式登入
  if (useMockMode) {
    console.log("使用模擬模式進行登入");
    // 簡單的模擬驗證邏輯
    let user = null;

    // 檢查是否是管理員帳號
    if (
      (usernameOrEmail === "admin" || usernameOrEmail === "admin@example.com") &&
      password === "admin123"
    ) {
      user = MOCK_USERS.admin;
    }
    // 檢查是否是測試帳號 (test)
    else if (
      (usernameOrEmail === "test" || usernameOrEmail === "test@example.com") &&
      password === "password123"
    ) {
      user = MOCK_USERS.test;
    }
    // 檢查是否是測試帳號 (testuser)
    else if (
      (usernameOrEmail === "testuser" ||
        usernameOrEmail === "testuser@example.com") &&
      password === "password123"
    ) {
      user = MOCK_USERS.testuser;
    }
    // 允許任何帳密都能登入 - 用於測試
    else if (usernameOrEmail && password) {
      // 創建一個自定義的模擬用戶
      user = {
        id: 999,
        username: usernameOrEmail,
        email: `${usernameOrEmail}@example.com`,
        roles: ["ROLE_ADMIN"],
        accessToken: `mock-jwt-token-for-${usernameOrEmail}`,
      };
    }

    if (user) {
      console.log(`模擬登入成功: ${user.username}`);

      // 檢查是否是管理員帳號
      if (user.roles.includes("ROLE_ADMIN")) {
        // 先清除再存入新令牌，確保無殘留狀態
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        
        // 設置新令牌和用戶信息
        localStorage.setItem("adminToken", user.accessToken);
        localStorage.setItem("adminUser", JSON.stringify(user));
        
        // 記錄存入後的狀態，方便除錯
        console.log("已存入令牌和用戶信息:", {
          token: localStorage.getItem("adminToken") ? "存在" : "不存在",
          user: localStorage.getItem("adminUser") ? "存在" : "不存在"
        });
        
        return { success: true, data: user };
      } else {
        // 如果不是管理員帳號，但我們在管理後台，則拒絕登入
        console.error("此帳戶沒有管理員權限");
        throw new Error("此帳戶沒有管理員權限，請使用管理員帳戶登入");
      }
    } else {
      console.error("模擬登入失敗：憑證不正確");
      throw new Error("登入失敗：用戶名或密碼不正確");
    }
  } 
  // 使用實際後端API登入
  else {
    console.log("嘗試使用實際後端API登入");
    try {
      // 使用標準登入路徑
      const loginEndpoint = validateApiPath("/api/auth/signin");
      
      const credentials = {
        username: usernameOrEmail,
        password: password
      };
      
      // 設置請求選項
      const options = {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000 // 5秒超時
      };
      
      // 嘗試登入
      const response = await axiosInstance.post(loginEndpoint, credentials, options);
      
      if (response.data && response.data.accessToken) {
        console.log("真實API登入成功", response.data);
        
        // 確認用戶具有 ADMIN 角色
        const hasAdminRole = 
          response.data.roles && 
          Array.isArray(response.data.roles) && 
          response.data.roles.includes("ROLE_ADMIN");
          
        if (!hasAdminRole) {
          console.error("此帳戶沒有管理員權限");
          throw new Error("此帳戶沒有管理員權限，請使用管理員帳戶登入");
        }
        
        // 將資料保存到 localStorage
        localStorage.setItem("adminToken", response.data.accessToken);
        localStorage.setItem("adminUser", JSON.stringify(response.data));
        
        // 記錄存入後的狀態
        console.log("已存入令牌和用戶信息:", {
          token: localStorage.getItem("adminToken") ? "存在" : "不存在",
          user: localStorage.getItem("adminUser") ? "存在" : "不存在"
        });
        
        return { success: true, data: response.data };
      } else {
        console.error("登入響應缺少 accessToken:", response);
        throw new Error("登入失敗，返回數據格式不正確");
      }
    } catch (error) {
      console.error("後端登入請求失敗:", error);
      
      // 檢查是否有詳細錯誤信息
      const errorMessage = 
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "登入失敗，請檢查您的帳號和密碼";
          
      throw new Error(errorMessage);
    }
  }
};

// 獲取當前管理員信息
const getCurrentAdmin = () => {
  const adminUser = localStorage.getItem("adminUser");
  if (!adminUser) return null;

  try {
    const userData = JSON.parse(adminUser);
    // 驗證數據完整性
    if (!userData || !userData.username || !userData.roles) {
      console.error("管理員用戶數據不完整");
      return null;
    }
    return userData;
  } catch (error) {
    console.error("解析管理員用戶數據失敗", error);
    return null;
  }
};

// 檢查用戶是否已登入並擁有管理員權限
const isAdminAuthenticated = () => {
  const adminUser = getCurrentAdmin();
  const token = localStorage.getItem("adminToken");

  // 先做簡單驗證，避免不必要的日誌輸出
  if (!adminUser || !token) {
    return false;
  }

  console.log("檢查管理員登入狀態:", {
    token: token ? "存在" : "不存在",
    user: adminUser ? "存在" : "不存在",
    roles: adminUser.roles || "無角色信息"
  });

  // 實行更嚴格的驗證
  if (!Array.isArray(adminUser.roles)) {
    console.log("驗證失敗: 用戶角色不是有效數組");
    return false;
  }

  if (!adminUser.roles.includes("ROLE_ADMIN")) {
    console.log("驗證失敗: 用戶沒有管理員角色");
    return false;
  }

  return true;
};

const AuthService = {
  login,
  logout,
  getCurrentAdmin,
  isAdminAuthenticated,
  axiosInstance,
  axiosRootInstance,
  checkBackendAvailability,
};

export default AuthService;
