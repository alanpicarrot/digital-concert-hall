import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/authService';

/**
 * 管理員路由元件，用於保護管理後台頁面
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 開發模式下輸出用戶資訊，方便調試
  if (user) {
    console.log('當前用戶信息:', user);
  }

  // 如果認證狀態還在加載中，顯示載入指示器
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 確保用戶登入狀態有效
  const isValidAdmin = AuthService.isAdminAuthenticated();
  console.log('检查管理員验证状态:', { isAuthenticated, isValidAdmin });

  if (!isValidAdmin || !isAuthenticated) {
    console.log('未登入或验证失败，重定向到登入页面');
    
    // 清除狀態
    AuthService.logout();
    
    // 重定向到登入頁面
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 如果用戶已登入且權限正確，渲染子路由
  console.log('用戶已通過權限驗證，渲染子路由');
  return children;
};

export default AdminRoute;