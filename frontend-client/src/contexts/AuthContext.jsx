import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';

// 創建認證上下文
const AuthContext = createContext();

// 認證提供者元件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化時從 localStorage 獲取用戶信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('開始初始化認證狀態');
        
        // 直接檢查 localStorage 中的原始數據
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('原始 localStorage 中的數據:', { userStr: !!userStr, tokenExists: !!token });
        
        // 首先確保用戶資料與令牌一致
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('從 localStorage 讀取的用戶:', userData.username);
            
            // 設置認證狀態
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('完成認證狀態設置', {username: userData.username, isAuthenticated: true});
          } catch (e) {
            console.error('解析用戶數據時出錯:', e);
            // 清除無效數據
            AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('沒有有效用戶或令牌');
          // 清除可能錯誤的存儲
          AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('初始化認證狀態失敗', error);
        // 清除可能錯誤的存儲
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登入函數
  const login = async (username, password) => {
    try {
      setLoading(true);
      // 調用 AuthService 的登入方法
      const userData = await AuthService.login(username, password);
      console.log('登入成功，用戶數據:', userData.username);
      
      // 更新狀態
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('登入後認證狀態已更新:', { 
        isAuthenticated: true, 
        username: userData.username 
      });
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('登入失敗', error);
      // 確保重設狀態
      setIsAuthenticated(false);
      setUser(null);
      return { 
        success: false, 
        message: error.response?.data?.message || '登入失敗，請檢查您的帳號和密碼'
      };
    } finally {
      setLoading(false);
    }
  };

  // 註冊函數
  const register = async (userData) => {
    try {
      setLoading(true);
      const { username, email, password, firstName, lastName } = userData;
      const response = await AuthService.register(username, email, password, firstName, lastName);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('註冊失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '註冊失敗，請稍後再試'
      };
    } finally {
      setLoading(false);
    }
  };

  // 登出函數
  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('用戶已登出，認證狀態已清除');
  };

  // 重設密碼請求
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await AuthService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('重設密碼請求失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '重設密碼請求失敗，請稍後再試'
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
      console.error('重設密碼失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '重設密碼失敗，可能連結已過期'
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
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('更新用戶資料失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '更新用戶資料失敗，請稍後再試'
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
      console.error('更新密碼失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '更新密碼失敗，請檢查當前密碼是否正確'
      };
    } finally {
      setLoading(false);
    }
  };

  // 添加一個顯式的更新驗證狀態的方法，方便必要時調用
  const updateAuthState = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('手動更新認證狀態');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } catch (e) {
        console.error('解析用戶數據失敗', e);
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
    setIsAuthenticated
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