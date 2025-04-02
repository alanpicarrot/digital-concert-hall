import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  // 器周的身份驗證
  // 確保清除無效的登入狀態
  if (!localStorage.getItem('adminToken')) {
    console.log('沒有有效的登入令牌，清除狀態');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
  
  // 如果用戶未登入，重定向到登入頁面
  if (!isAuthenticated || !user) {
    console.log('未登入或沒有用戶信息，重定向到登入頁面');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 檢查用戶角色
  if (user && Array.isArray(user.roles) && !user.roles.includes('ROLE_ADMIN')) {
    console.log('非管理員角色，重定向到登入頁面', user.roles);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 如果用戶已登入且權限正確，渲染子路由
  console.log('用戶已通過權限驗證，渲染子路由');
  return children;
};

export default AdminRoute;