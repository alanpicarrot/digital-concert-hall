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
        // 清除所有人預設的情況
        console.log('開始登入檢查，確保沒有預設用戶');
        window.testUserCleared = true;
        
        // 首先假設沒有登入
        setUser(null);
        setIsAuthenticated(false);
        
        // 然後檢查是否真的登入了
        const adminUser = AuthService.getCurrentAdmin();
        const token = localStorage.getItem('adminToken');
        
        // 只有當同時有用戶數據和令牌時才設置認證狀態
        if (adminUser && token) {
          // 進一步檢查用戶數據是否完整
          if (adminUser.username && adminUser.roles) {
            console.log('在本地存儲找到有效的用戶登入', adminUser.username);
            setUser(adminUser);
            setIsAuthenticated(true);
          } else {
            // 數據不完整，清除
            console.log('本地存儲的用戶數據不完整，清除');
            AuthService.logout();
          }
        } else {
          // 不存在憑證，確保登出狀態
          console.log('沒有發現有效的用戶登入憑證');
          AuthService.logout();
        }
      } catch (error) {
        console.error('初始化管理員認證狀態失敗', error);
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
      console.log('Context: 嘗試登入', { username });
      setLoading(true);
      
      // 確保登入前先清除狀態
      setUser(null);
      setIsAuthenticated(false);
      
      // 嘗試登入處理
      try {
        console.log('嘗試登入處理: 使用提供的憑證');
        const data = await AuthService.login(username, password);
        
        // 確認返回數據完整性
        if (data && data.username && data.accessToken) {
          console.log('登入成功:', data.username);
          setUser(data);
          setIsAuthenticated(true);
          return { success: true, data };
        } else {
          console.error('登入失敗: 返回數據不完整');
          setUser(null);
          setIsAuthenticated(false);
          return { 
            success: false, 
            message: '登入失敗: 用戶數據不完整'
          };
        }
      } catch (error) {
        console.error('登入處理失敗:', error);
        setUser(null);
        setIsAuthenticated(false);
        return { 
          success: false, 
          message: error.response?.data?.message || '登入失敗，請檢查您的帳號和密碼'
        };
      }
    } catch (error) {
      console.error('管理員登入失敗', error);
      setUser(null);
      setIsAuthenticated(false);
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