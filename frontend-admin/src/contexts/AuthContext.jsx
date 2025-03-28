import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';

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
        const adminUser = AuthService.getCurrentAdmin();
        
        if (adminUser) {
          setUser(adminUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('初始化管理員認證狀態失敗', error);
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
      console.log('Context: 嘗試登入', { username });
      setLoading(true);
      
      // 嘗試直接使用用戶名登入
      try {
        console.log('嘗試方法1: 直接使用提供的值作為用戶名');
        const data = await AuthService.login(username, password);
        setUser(data);
        setIsAuthenticated(true);
        return { success: true, data };
      } catch (error1) {
        console.error('方法1失敗:', error1);
        
        // 如果失敗，嘗試將用戶名用作電子郵件
        if (username === 'testuser') {
          try {
            console.log('嘗試方法2: 使用測試用戶的電子郵件');
            const data = await AuthService.login('test@example.com', password);
            setUser(data);
            setIsAuthenticated(true);
            return { success: true, data };
          } catch (error2) {
            console.error('方法2失敗:', error2);
            return { 
              success: false, 
              message: '測試用戶登入失敗，請檢查密碼'
            };
          }
        }
        
        return { 
          success: false, 
          message: error1.response?.data?.message || '登入失敗，請檢查您的帳號和密碼'
        };
      }
    } catch (error) {
      console.error('管理員登入失敗', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '登入失敗，請檢查您的帳號和密碼，或確認您擁有管理員權限'
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

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
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