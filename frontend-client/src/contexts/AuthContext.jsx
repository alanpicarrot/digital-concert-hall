import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';
import { validateApiPath } from '../utils/apiUtils'; // Import validateApiPath

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
    const token = localStorage.getItem('token');
    
    // 如果令牌存在，將其添加到請求頭中
    if (token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('為請求添加認證令牌');
      }
      
      // 確保 config 和 headers 物件存在
      config = config || {};
      config.headers = config.headers || {};
      
      // 添加 Authorization 頭
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (process.env.NODE_ENV === 'development') {
      console.log('沒有令牌可用於請求認證');
    }
    
    return config;
  };

  // 初始化時從 localStorage 獲取用戶信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('開始初始化認證狀態');
        }
        
        // 初始化請求認證配置
        setupPreRequestAuth();
        
        // 直接檢查 localStorage 中的原始數據
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('原始 localStorage 中的數據:', { userStr: !!userStr, tokenExists: !!token });
        }
        
        // 首先確保用戶資料與令牌一致
        if (token && userStr) {
          try {
            // Attempt to validate token with backend
            console.log('Token and user string found in localStorage, attempting to validate with backend...');
            const response = await AuthService.axiosInstance.get(validateApiPath('/api/user/profile'));
            
            if (response.status === 200 && response.data) {
              const freshUserData = response.data;
              localStorage.setItem('user', JSON.stringify(freshUserData));
              setUser(freshUserData);
              setIsAuthenticated(true);
              console.log('Token validated with backend, user set:', freshUserData.username);
            } else {
              // Should not happen if API call is successful, but as a fallback
              console.warn('Token validation API call successful but response was not as expected.');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (validationError) {
            console.error('Token validation failed or API error:', validationError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            // No need to call setLoading(false) here, it's in the finally block
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('No token or user string found in localStorage.');
          }
          // 清除可能錯誤的存儲
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) { // This outer catch is for errors in the overall initAuth logic
        console.error('Error during initAuth (outside of token validation):', error);
        // Ensure state is cleared if any unexpected error occurs before or after validation attempt
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Ensure setLoading(false) is called once after all operations
        if (process.env.NODE_ENV === 'development') {
          console.log('initAuth finished, loading set to false.');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // 調用 AuthService 的登入方法
      console.log('開始調用 AuthService.login 方法');
      try {
        const userData = await AuthService.login(username, password);
        console.log('登入成功，用戶數據:', userData.username);
        
        if (!userData || !userData.accessToken) {
          console.error('登入返回的數據不完整，缺少令牌');
          return { 
            success: false, 
            message: '登入失敗，伺服器回應不完整' 
          };
        }
        
        // 檢查令牌格式
        const tokenParts = userData.accessToken.split('.');
        if (tokenParts.length !== 3) {
          console.error('收到不正確格式的令牌');
          return { 
            success: false, 
            message: '登入失敗，認證令牌格式不正確' 
          };
        }
        
        // 更新狀態
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('登入後認證狀態已更新:', { 
          isAuthenticated: true, 
          username: userData.username 
        });
        
        return { success: true, data: userData };
      } catch (loginError) {
        // 特別處理 401 錯誤
        if (loginError.response && loginError.response.status === 401) {
          console.error('登入失敗，401 未經授權:', loginError.response.data);
          return { 
            success: false, 
            message: '用戶名或密碼錯誤，請重新輸入' 
          };
        }
        // 處理其他登入錯誤
        console.error('登入中發生錯誤:', loginError);
        const errorMessage = loginError.response?.data?.message || 
                           loginError.message || 
                           '登入失敗，請檢查您的帳號和密碼';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('登入處理失敗', error);
      // 確保重設狀態
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      return { 
        success: false, 
        message: error.response?.data?.message || '登入失敗，請稍後再試'
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
    console.log('開始執行登出操作');
    
    // 先清除本地存儲狀態
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 清除從某些頁面可能存儲的臨時資訊
    sessionStorage.removeItem('checkoutInfo');
    
    // 再清除狀態
    setUser(null);
    setIsAuthenticated(false);
    
    // 嘗試發送登出請求到伺服器，但不受到伺服器回應的影響
    try {
      AuthService.logout()
        .then(() => console.log('登出請求成功'))
        .catch(err => console.warn('登出請求失敗，但已在本地登出：', err.message));
    } catch (error) {
      console.error('執行登出請求失敗，但已在本地完成登出', error);
    }
    
    // 再次確認清除本地存儲
    setTimeout(() => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token || userStr) {
        console.warn('登出後仍發現本地存儲中有認證資訊，再次清除');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        console.log('登出後本地存儲確認已清除');
      }
    }, 100);
    
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('手動更新認證狀態');
    }
    
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
    setIsAuthenticated,
    setupPreRequestAuth // 添加設置請求認證的函數
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