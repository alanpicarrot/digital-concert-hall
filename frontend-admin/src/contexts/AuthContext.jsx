import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // 導入 useNavigate
import AuthService from "../services/authService";
import {
  clearAuthState,
  saveAuthState,
  isAuthValid,
  setupPreRequestAuth,
} from "../utils/authPersistUtils";

// 創建認證上下文
const AuthContext = createContext();

// 認證提供者元件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 初始化時從 localStorage 獲取管理員信息
  useEffect(() => {
    const initAuth = () => {
      try {
        // console.log("開始登入狀態檢查...");
        setLoading(true);
        setupPreRequestAuth();

        if (isAuthValid()) {
          const adminUserStr = localStorage.getItem("adminUser");
          try {
            const adminUser = JSON.parse(adminUserStr);
            // console.log("登入狀態驗證通過，使用者：", adminUser.username);
            setUser(adminUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("解析用戶數據失敗:", parseError);
            clearAuthState();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // console.log("本地存儲驗證無效");
          clearAuthState();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("登入狀態檢查過程出錯：", error);
        clearAuthState();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 設置定期檢查登入狀態的機制
    const checkAuthInterval = setInterval(() => {
      const adminToken = localStorage.getItem("adminToken");
      const adminUserStr = localStorage.getItem("adminUser");

      if (isAuthenticated && adminToken && adminUserStr) {
        // console.log("執行定期登入狀態檢查（已登入狀態）");
        // console.log("定期檢查存儲狀態:", {
        //   token: adminToken ? "存在" : "不存在",
        //   userStr: adminUserStr ? "存在" : "不存在",
        // });

        const currentIsAuthenticated = AuthService.isAdminAuthenticated();
        // console.log("當前驗證狀態:", currentIsAuthenticated);
        // console.log("內部isAuthenticated狀態:", isAuthenticated);

        if (!currentIsAuthenticated) {
          console.log("定期檢查發現登入已過期，重置狀態並導向根目錄");
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate('/', { replace: true });
        }
      } else if (!isAuthenticated && adminToken && adminUserStr) {
        console.log("檢測到異常狀態：有令牌但內部標記為未登入");
        try {
          if (AuthService.isAdminAuthenticated()) {
            console.log("修正内部狀態不一致");
            const adminUser = AuthService.getCurrentAdmin();
            if (adminUser) {
              setUser(adminUser);
              setIsAuthenticated(true);
            }
          } else {
            console.log("令牌無效，清除本地存儲");
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
          }
        } catch (error) {
          console.error("狀態不一致修復失敗:", error);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        }
      }
    }, 30000); // 每30秒檢查一次

    return () => clearInterval(checkAuthInterval);
  }, [isAuthenticated, navigate]);

  // 登入函數
  const login = async (username, password) => {
    try {
      // console.log("Context: 嘗試登入", { username });
      setLoading(true);
      clearAuthState();
      setUser(null);
      setIsAuthenticated(false);

      try {
        // console.log("嘗試登入處理: 使用提供的憑證");
        const result = await AuthService.login(username, password);

        if (result && result.success && result.data) {
          // console.log("登入成功:", result.data.username);
          saveAuthState(result.data.accessToken, result.data);
          setUser(result.data);
          setIsAuthenticated(true);
          return { success: true, data: result.data };
        } else {
          console.error("登入失敗: 返回數據不完整");
          return {
            success: false,
            message: "登入失敗: 用戶數據不完整",
          };
        }
      } catch (error) {
        console.error("登入處理失敗:", error);
        return {
          success: false,
          message: error.message || "登入失敗，請檢查您的帳號和密碼",
        };
      }
    } catch (error) {
      console.error("管理員登入失敗", error);
      return {
        success: false,
        message:
          error.message ||
          "登入失敗，請檢查您的帳號和密碼，或確認您擁有管理員權限",
      };
    } finally {
      setLoading(false);
    }
  };

  // 登出函數
  const logout = () => {
    // console.log("開始執行用戶登出操作");
    setUser(null);
    setIsAuthenticated(false);
    clearAuthState();
    try {
      // console.log("呼叫 AuthService.logout() 方法");
      AuthService.logout(); // Note: AuthService.logout itself might have logs
      // console.log("登出操作完成");
    } catch (error) {
      console.error("登出過程中發生錯誤:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    axiosInstance: AuthService.axiosInstance,
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
