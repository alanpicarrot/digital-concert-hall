/**
 * 認證持久化工具
 * 用於確保跨頁面導航時登入狀態不丟失
 */
import axios from "axios";

/**
 * 設置全局默認認證標頭
 * 確保每個頁面加載時都能使用儲存的令牌
 */
export const setupAuthHeaders = () => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      // console.log(
      //   "%c設置全局認證標頭：%c 令牌: " + adminToken.substring(0, 10) + "...",
      //   "color: green; font-weight: bold",
      //   "color: blue"
      // );

      // 設置全局默認標頭
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

      // 確保 AuthService 中的實例也有相同的標頭設置
      // try {
      //   if (axios.interceptors && axios.interceptors.request) {
      //     // console.log("確保所有請求都會帶上 Authorization 標頭");
      //   }
      // } catch (instanceErr) {
      //   console.error("設置實例標頭失敗:", instanceErr);
      // }

      return true;
    } else {
      // console.warn("%c未找到儲存的認證令牌", "color: red; font-weight: bold");
      delete axios.defaults.headers.common["Authorization"];
      return false;
    }
  } catch (error) {
    console.error("設置認證標頭過程發生錯誤:", error);
    return false;
  }
};

/**
 * 清除認證標頭和本地儲存
 */
export const clearAuthState = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  delete axios.defaults.headers.common["Authorization"];
  // console.log("已清除認證狀態和標頭");
};

/**
 * 保存認證狀態到本地儲存
 */
export const saveAuthState = (token, userData) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(userData));
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  // console.log("已保存認證狀態並設置標頭");
};

/**
 * 檢查本地儲存中的認證狀態是否有效
 */
export const isAuthValid = () => {
  const token = localStorage.getItem("adminToken");
  const userStr = localStorage.getItem("adminUser");

  if (!token || !userStr) return false;

  try {
    const user = JSON.parse(userStr);
    // 檢查用戶物件、用戶名是否存在，以及角色陣列是否包含 'ROLE_ADMIN'
    return !!(
      user &&
      user.username &&
      Array.isArray(user.roles) &&
      user.roles.includes("ROLE_ADMIN")
    );
  } catch (e) {
    console.error("解析用戶數據錯誤:", e);
    return false;
  }
};

/**
 * 在每個 API 請求前確保認證標頭設置正確
 * 這是一個重要的函數，用於解決認證在導航中丟失的問題
 */
export const setupPreRequestAuth = () => {
  // 在每個請求發送前設置認證標頭 (針對 fetch API)
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    setupAuthHeaders(); // 確保 fetch 也使用最新的標頭
    return originalFetch.apply(this, args);
  };

  // 確保只註冊一次攔截器並避免重複
  // 使用全局變量追蹤是否已註冊
  if (!window.hasSetupInterceptors) {
    // console.log("第一次設置攔截器");
    window.hasSetupInterceptors = true;
  }

  // 確保只在第一次設置時註冊請求攔截器以避免重複
  if (!window.hasSetupRequestInterceptor) {
    window.hasSetupRequestInterceptor = true;
    // console.log("註冊請求攔截器");

    // 攔截所有 axios 請求
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
          config.headers = config.headers || {}; // 確保 headers 物件存在
          config.headers["Authorization"] = `Bearer ${token}`;
          // console.log("在請求攔截器中設置授權標頭", config.url);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          if (config.headers) {
            delete config.headers["Authorization"];
          }
          delete axios.defaults.headers.common["Authorization"];
        }
        return config;
      },
      (error) => {
        console.error("請求攔截器錯誤:", error); // 添加錯誤日誌
        return Promise.reject(error);
      }
    );
    window.requestInterceptor = requestInterceptor;
  }

  // 確保只在第一次設置時註冊響應攔截器
  if (!window.hasSetupResponseInterceptor) {
    window.hasSetupResponseInterceptor = true;
    // console.log("註冊響應攔截器");

    // 添加響應攔截器處理權限錯誤
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response, // 對成功響應不做處理
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("接收到 401 錯誤");

          // 檢查是否是登入請求本身失敗
          if (
            error.config.url &&
            error.config.url.includes("/api/auth/admin/signin") // Adjusted path
          ) {
            console.log("登入請求失敗 (401)，可能是憑證錯誤。");
            return Promise.reject(error);
          }

          // 對於其他請求的 401 錯誤，執行登出邏輯
          console.log("非登入請求的 401 錯誤，執行登出並重定向。");
          clearAuthState(); // 清除本地儲存和 axios 默認標頭

          // 重定向到登入頁面
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/auth/login")) {
            console.log("重定向到 /auth/login");
            window.location.href = "/auth/login"; // 使用瀏覽器原生重定向
          } else {
            // console.log("已在登入頁面，不執行重定向");
          }
        }
        return Promise.reject(error);
      }
    );
    window.responseInterceptor = responseInterceptor;
  }

  // 在頁面卸載前保存認證狀態 (例如，記錄最後訪問路徑)
  window.addEventListener("beforeunload", () => {
    if (isAuthValid()) {
      sessionStorage.setItem("lastAuthenticatedPath", window.location.pathname);
    }
  });

  // 頁面加載時檢查認證狀態並設置標頭
  window.addEventListener("load", () => {
    setupAuthHeaders(); // 確保頁面加載時標頭是最新的
  });

  // 清除可能存在的舊定時器
  if (window.authTokenCheckInterval) {
    clearInterval(window.authTokenCheckInterval);
    // console.log("清除現有的令牌檢查定時器");
  }

  // 設置新的定時器，定期調用 setupAuthHeaders 確保標頭正確
  window.authTokenCheckInterval = setInterval(() => {
    const hasToken = setupAuthHeaders(); // 檢查並設置標頭
    // 僅在開發模式下輸出詳細日誌
    // if (process.env.NODE_ENV === "development") {
    //   console.log(
    //     "定期令牌標頭檢查: " + (hasToken ? "標頭已設置" : "未找到令牌")
    //   );
    // }
  }, 30000); // 每 30 秒檢查一次

  // console.log("已設置全局請求認證保護，包含定期檢查");
};
