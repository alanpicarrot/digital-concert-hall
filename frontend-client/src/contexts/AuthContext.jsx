import React, { createContext, useState, useEffect, useContext } from "react";
import AuthService from "../services/authService";
import { validateApiPath } from "../utils/apiUtils"; // Import validateApiPath

// 創建認證上下文
const AuthContext = createContext();

// 認證提供者元件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 設置請求前的認證配置
  const setupPreRequestAuth = (config) => {
    // 獲取本地存儲中的令牌
    const token = localStorage.getItem("token");

    // 如果令牌存在，將其添加到請求頭中
    if (token) {
      if (process.env.NODE_ENV === "development") {
        console.log("為請求添加認證令牌");
      }

      // 確保 config 和 headers 物件存在
      config = config || {};
      config.headers = config.headers || {};

      // 添加 Authorization 頭
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  };

  // 暴露 setupPreRequestAuth 到全域，供其他服務使用
  useEffect(() => {
    window.__AUTH_CONTEXT__ = { setupPreRequestAuth };
    return () => {
      delete window.__AUTH_CONTEXT__;
    };
  }, []);

  // 初始化時從 localStorage 獲取用戶信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("開始初始化認證狀態");
        }

        // 直接檢查 localStorage 中的原始數據
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (process.env.NODE_ENV === "development") {
          console.log("localStorage 認證數據檢查:", {
            userExists: !!userStr,
            tokenExists: !!token,
            tokenLength: token?.length,
          });
        }

        // 如果有token和user數據，直接設置認證狀態，不進行後端驗證
        // 將token驗證工作交給實際的API調用時處理
        if (token && userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser && parsedUser.username) {
              setUser(parsedUser);
              setIsAuthenticated(true);
              console.log("從localStorage恢復認證狀態:", parsedUser.username);
            } else {
              throw new Error("用戶數據格式不正確");
            }
          } catch (parseError) {
            console.error("解析用戶數據失敗:", parseError);
            // 清除損壞的數據
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("localStorage中沒有認證數據");
          }
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("認證初始化過程中發生錯誤:", error);
        // 確保清除狀態
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        if (process.env.NODE_ENV === "development") {
          console.log("認證初始化完成，loading設為false");
        }
      }
    };

    initAuth();
  }, []);

  // 登入函數
  const login = async (username, password) => {
    try {
      setLoading(true);
      // 先清除可能存在的舊登入資料
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      // 調用 AuthService 的登入方法
      console.log("開始調用 AuthService.login 方法");
      const userData = await AuthService.login(username, password);
      console.log("登入成功，用戶數據:", userData.username);

      if (!userData || !userData.accessToken) {
        console.error("登入返回的數據不完整，缺少令牌");
        return {
          success: false,
          message: "登入失敗，伺服器回應不完整",
        };
      }

      // 立即設置認證狀態
      setUser(userData);
      setIsAuthenticated(true);

      // 確保數據寫入localStorage
      localStorage.setItem("token", userData.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("登入後認證狀態已更新:", {
        isAuthenticated: true,
        username: userData.username,
      });

      return { success: true, data: userData };
    } catch (error) {
      console.error("登入處理失敗:", error);
      // 確保重設狀態
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);

      // 處理不同類型的錯誤
      let errorMessage = "登入失敗，請稍後再試";
      if (error.response?.status === 401) {
        errorMessage = "用戶名或密碼錯誤，請重新輸入";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 註冊函數
  const register = async (userData) => {
    try {
      setLoading(true);
      const { username, email, password, firstName, lastName } = userData;
      const response = await AuthService.register(
        username,
        email,
        password,
        firstName,
        lastName
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("註冊失敗", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "註冊失敗，請稍後再試",
      };
    } finally {
      setLoading(false);
    }
  };

  // 登出函數
  const logout = () => {
    console.log("開始執行登出操作");

    // 先清除本地存儲狀態
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 清除從某些頁面可能存儲的臨時資訊
    sessionStorage.removeItem("checkoutInfo");

    // 再清除狀態
    setUser(null);
    setIsAuthenticated(false);

    // 嘗試發送登出請求到伺服器，但不受到伺服器回應的影響
    try {
      AuthService.logout()
        .then(() => console.log("登出請求成功"))
        .catch((err) =>
          console.warn("登出請求失敗，但已在本地登出：", err.message)
        );
    } catch (error) {
      console.error("執行登出請求失敗，但已在本地完成登出", error);
    }

    // 再次確認清除本地存儲
    setTimeout(() => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token || userStr) {
        console.warn("登出後仍發現本地存儲中有認證資訊，再次清除");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else {
        console.log("登出後本地存儲確認已清除");
      }
    }, 100);

    console.log("用戶已登出，認證狀態已清除");
  };

  // 重設密碼請求
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await AuthService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error("重設密碼請求失敗", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "重設密碼請求失敗，請稍後再試",
      };
    } finally {
      setLoading(false);
    }
  };

  // 重設密碼
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await AuthService.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      console.error("重設密碼失敗", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "重設密碼失敗，可能連結已過期",
      };
    } finally {
      setLoading(false);
    }
  };

  // 更新用戶資料
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.updateProfile(userData);

      // 更新本地存儲的用戶信息
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("更新用戶資料失敗", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "更新用戶資料失敗，請稍後再試",
      };
    } finally {
      setLoading(false);
    }
  };

  // 更新密碼
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await AuthService.updatePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error("更新密碼失敗", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "更新密碼失敗，請檢查當前密碼是否正確",
      };
    } finally {
      setLoading(false);
    }
  };

  // 添加一個顯式的更新驗證狀態的方法，方便必要時調用
  const updateAuthState = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (process.env.NODE_ENV === "development") {
      console.log("手動更新認證狀態");
    }

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } catch (e) {
        console.error("解析用戶數據失敗", e);
        return false;
      }
    } else {
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    updateAuthState,
    setUser, // 暴露這些方法以便在必要時直接操作
    setIsAuthenticated,
    setupPreRequestAuth, // 添加設置請求認證的函數
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定義 Hook 讓組件能夠訪問認證上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 內使用");
  }
  return context;
};

export default AuthContext;
