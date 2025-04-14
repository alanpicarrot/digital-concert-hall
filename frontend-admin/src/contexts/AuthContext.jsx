import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';
import axios from 'axios';

// 創建認證上下文
const AuthContext = createContext();

// 認證提供者元件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化時從 localStorage 獲取管理員信息
  useEffect(() => {
    const initAuth = () => {
      try {
        console.log('開始登入狀態檢查...');
        
        // 設置加載中狀態
        setLoading(true);
        
        // 記錄當前localStorage狀態
        const adminToken = localStorage.getItem("adminToken");
        const adminUserStr = localStorage.getItem("adminUser");
        console.log('當前存儲狀態:', {
          token: adminToken ? '存在' : '不存在',
          userStr: adminUserStr ? '存在' : '不存在'
        });
        
        // 只有在有存儲令牌時才驗證登入狀態
        if (adminToken && adminUserStr) {
          // 使用 AuthService 的 isAdminAuthenticated 來檢查登入狀態
          if (AuthService.isAdminAuthenticated()) {
            const adminUser = AuthService.getCurrentAdmin();
            console.log('登入狀態驗證通過，使用者：', adminUser.username);
            setUser(adminUser);
            setIsAuthenticated(true);
          } else {
            // 無效登入時清除所有狀態，但不呼叫登出 API
            console.log('登入狀態無效，重置狀態（僅清除本地存儲）');
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // 沒有存儲令牌，直接設置為未登入狀態
          console.log('沒有存儲的登入憑證，設置為未登入狀態');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('登入狀態檢查過程出錯：', error);
        // 不呼叫登出API，只清除本地狀態
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    // 設置定期檢查登入狀態的機制
    const checkAuthInterval = setInterval(() => {
      // 記錄當前存儲狀態
      const adminToken = localStorage.getItem("adminToken");
      const adminUserStr = localStorage.getItem("adminUser");
      
      // 只有在已登入且有本地存儲時才進行檢查
      if (isAuthenticated && adminToken && adminUserStr) {
        console.log('執行定期登入狀態檢查（已登入狀態）');
        console.log('定期檢查存儲狀態:', {
          token: adminToken ? '存在' : '不存在',
          userStr: adminUserStr ? '存在' : '不存在'
        });
        
        const currentIsAuthenticated = AuthService.isAdminAuthenticated();
        console.log('當前驗證狀態:', currentIsAuthenticated);
        console.log('內部isAuthenticated狀態:', isAuthenticated);
        
        if (!currentIsAuthenticated) {
          console.log('定期檢查發現登入已過期，重置狀態');
          setUser(null);
          setIsAuthenticated(false);
          
          // 只清除本地存儲，不呼叫登出API
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          
          // 重導到登入頁面
          window.location.href = '/auth/login';
        }
      } else if (!isAuthenticated && adminToken && adminUserStr) {
        // 處理有存儲但內部狀態為未登入的情況
        console.log('檢測到異常狀態：有令牌但內部標記為未登入');
        try {
          if (AuthService.isAdminAuthenticated()) {
            console.log('修正内部狀態不一致');
            const adminUser = AuthService.getCurrentAdmin();
            if (adminUser) {
              setUser(adminUser);
              setIsAuthenticated(true);
            }
          } else {
            console.log('令牌無效，清除本地存儲');
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
          }
        } catch (error) {
          console.error('狀態不一致修復失敗:', error);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        }
      }
    }, 30000); // 每30秒檢查一次
    
    return () => clearInterval(checkAuthInterval);
  }, [isAuthenticated]); // 依賴於isAuthenticated，確保其變化時重新運行檢查

  // 登入函數
  const login = async (username, password) => {
    try {
      console.log('Context: 嘗試登入', { username });
      setLoading(true);
      
      // 確保登入前先清除狀態
      setUser(null);
      setIsAuthenticated(false);
      
      // 先清除localStorage中的舊狀態
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      
      // 嘗試登入處理
      try {
        console.log('嘗試登入處理: 使用提供的憑證');
        const result = await AuthService.login(username, password);
        
        if (result && result.success && result.data) {
          console.log('登入成功:', result.data.username);
          
          // 再次確認令牌已存到localStorage
          const adminToken = localStorage.getItem("adminToken");
          const adminUserStr = localStorage.getItem("adminUser");
          console.log('登入後存儲狀態:', {
            token: adminToken ? '存在' : '不存在',
            userStr: adminUserStr ? '存在' : '不存在'
          });
          
          // 設置內部狀態
          setUser(result.data);
          setIsAuthenticated(true);
          
          // 再次驗證登入狀態
          const isAuthValid = AuthService.isAdminAuthenticated();
          console.log('登入後驗證狀態:', isAuthValid ? '有效' : '無效');
          
          if (!isAuthValid) {
            console.error('登入後狀態驗證失敗，嘗試修復');
            // 嘗試修復失敗的登入狀態
            localStorage.setItem("adminToken", result.data.accessToken);
            localStorage.setItem("adminUser", JSON.stringify(result.data));
          }
          
          return { success: true, data: result.data };
        } else {
          console.error('登入失敗: 返回數據不完整');
          return { 
            success: false, 
            message: '登入失敗: 用戶數據不完整'
          };
        }
      } catch (error) {
        console.error('登入處理失敗:', error);
        return { 
          success: false, 
          message: error.message || '登入失敗，請檢查您的帳號和密碼'
        };
      }
    } catch (error) {
      console.error('管理員登入失敗', error);
      return { 
        success: false, 
        message: error.message || '登入失敗，請檢查您的帳號和密碼，或確認您擁有管理員權限'
      };
    } finally {
      setLoading(false);
    }
  };

  // 登出函數 - 呼叫登出API，但確保不會在初始化時觸發
  const logout = () => {
    if (isAuthenticated) {
      console.log('執行用戶登出操作');
      AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } else {
      console.log('用戶未登入，跳過登出API呼叫');
      // 仍清除任何可能的本地存儲
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    axiosInstance: AuthService.axiosInstance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定義 Hook 讓組件能夠訪問認證上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
};

export default AuthContext;