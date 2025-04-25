import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAuthValid, setupPreRequestAuth } from '../utils/authPersistUtils';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLocalAuthValid, setIsLocalAuthValid] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      setupPreRequestAuth();
      const validLocalAuth = isAuthValid();
      setIsLocalAuthValid(validLocalAuth);
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [location.pathname, isAuthenticated, user, adminOnly]);

  // 1. 檢查加載狀態
  if (loading || isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // 2. Check core authentication status
  if (!isAuthenticated || !isLocalAuthValid) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. 檢查管理員權限 (如果需要)
  if (adminOnly && !user?.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/" replace />;
  }

  // 4. 允許訪問
  return <Outlet />;
};

export default ProtectedRoute;