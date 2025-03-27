import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 管理員路由元件，用於保護管理後台頁面
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 如果認證狀態還在加載中，顯示載入指示器
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 如果用戶未登入或不是管理員，重定向到登入頁面
  if (!isAuthenticated || !user.roles.includes('ADMIN')) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 如果用戶已登入且是管理員，渲染子路由
  return children;
};

export default AdminRoute;
