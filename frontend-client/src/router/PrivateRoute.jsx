import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

/**
 * 私有路由元件，用於保護需要登入的頁面
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, updateAuthState } = useAuth();
  const location = useLocation();

  // 偵測從其他頁面傳遞的認證狀態
  const stateAuthenticated = location.state?.authenticated;

  // 使用useState跟踪認證驗證狀態
  const [verifiedAuth, setVerifiedAuth] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  // 直接檢查localStorage中的令牌和用户數據
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const hasLocalAuth = !!(token && userStr);

  // 處理非認證狀態下的認證更新
  useEffect(() => {
    if (!isAuthenticated && hasLocalAuth && !verifiedAuth) {
      updateAuthState();
    }
  }, [isAuthenticated, hasLocalAuth, updateAuthState, verifiedAuth]);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        setVerifying(true);
        // 輸出更詳細的狀態信息
        console.log('PrivateRoute - 認證檢查:', { 
          contextAuth: isAuthenticated,
          stateAuth: stateAuthenticated,
          hasLocalAuth: hasLocalAuth,
          pathname: location.pathname
        });
        
        // 簡化認證邏輯
        // 1. 如果項目的狀態樹動認證成功，直接認為有效
        if (stateAuthenticated) {
          console.log('從頁面狀態應得認證成功資訊');
          setVerifiedAuth(true);
          setVerifying(false);
          return;
        }
        
        // 2. 如果在 AuthContext 中已證實認證，直接認為有效
        if (isAuthenticated) {
          console.log('從 AuthContext 中檢測到認證成功狀態');
          setVerifiedAuth(true);
          setVerifying(false);
          return;
        }
        
        // 3. 如果 localStorage 有認證資訊，將其視為有效
        // 這是最簡單的驗證方法，將實際的令牌有效性驗證交給後端
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('從 localStorage 讀取的用戶資訊:', userData.username);
            
            // 更新認證狀態
            updateAuthState();
            setVerifiedAuth(true);
            console.log('本地驗證成功，允許訪問受保護路由');
          } catch (e) {
            console.error('解析用戶數據時出錯:', e);
            setVerifiedAuth(false);
          }
        } else {
          console.log('驗證失敗，用戶未登入或登入資料缺失');
          setVerifiedAuth(false);
        }
      } catch (err) {
        console.error('驗證過程中發生錯誤:', err);
        setVerifiedAuth(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyAuthentication();
  }, [isAuthenticated, stateAuthenticated, hasLocalAuth, updateAuthState, location.pathname, token, userStr]);

  // 如果正在驗證，顯示載入指示器
  if (verifying || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 如果已驗證認證狀態、狀態認證、全局認證或本地存儲有效，則允許訪問
  if (verifiedAuth || stateAuthenticated || isAuthenticated || hasLocalAuth) {
    console.log('認證成功，允許訪問受保護路由');
    return children;
  }

  // 如果用戶未登入，重定向到登入頁面，並保存原始頁面位置
  return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;
