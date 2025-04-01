import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  // 在應用程序加載時清除所有認證狀態，確保初始狀態是登出的
  useEffect(() => {
    console.log('App 組件加載 - 清除所有認證狀態');
    // 清除所有認證相關的 localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('_forceUpdate');
    // 清除任何可能的購物車或結帳信息
    sessionStorage.removeItem('checkoutInfo');
    
    console.log('初始化: 所有認證狀態已清除，用戶需要登入');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;