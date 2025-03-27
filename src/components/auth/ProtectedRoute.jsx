import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // 如果沒有登入，重定向到登入頁面，但保存當前位置以便登入後重定向回來
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
