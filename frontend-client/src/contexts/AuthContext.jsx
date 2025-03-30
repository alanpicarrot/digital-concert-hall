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
    const initAuth = () => {
      try {
        console.log('開始初始化認證狀態');
        const user = AuthService.getCurrentUser();
        console.log('從 localStorage 讀取的用戶:', user);
        
        if (user && user.accessToken) {
          console.log('用戶已登入，設置認證狀態');
          setUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('沒有有效用戶或令牌');
          // 清除可能錯誤的存儲
          AuthService.logout();
        }
      } catch (error) {
        console.error('初始化認證狀態失敗', error);
        // 清除可能錯誤的存儲
        AuthService.logout();
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
      const data = await AuthService.login(username, password);
      setUser(data);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('登入失敗', error);
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
    updatePassword
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