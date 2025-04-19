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
  const hasLoginTimestamp = !!location.state?.loginTimestamp;
  
  // 直接檢查localStorage中的令牌和用戶數據
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const hasLocalAuth = !!(token && userStr);

  // 更完整的認證驗證和詳細日誌
  // 處理非認證狀態下的認證更新
  useEffect(() => {
    if (!isAuthenticated && hasLocalAuth) {
      updateAuthState();
    }
  }, [isAuthenticated, hasLocalAuth, updateAuthState]);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        setVerifying(true);
        // 輸出更詳細的狀態信息
        console.log('PrivateRoute - 詳細檢查認證狀態:', { 
          contextAuth: isAuthenticated,
          stateAuth: stateAuthenticated,
          hasTimestamp: hasLoginTimestamp,
          pathname: location.pathname,
          state: JSON.stringify(location.state),
          hasLocalAuth: hasLocalAuth
        });
        
        // 優先檢查：如果傳入的狀態表示已認證，直接設為已驗證狀態
        if (stateAuthenticated && !verifiedAuth) {
          console.log('從其他頁面傳遞認證成功狀態，直接接受認證');
          setVerifiedAuth(true);
          setVerifying(false);
          return;
        }
        
        // 從localStorage直接驗證 - 不依賴isTokenValid
        // 嘗試解析用戶數據以進行更詳細的日誌
        let userData = null;
        try {
          if (userStr) {
            userData = JSON.parse(userStr);
          }
        } catch (e) {
          console.error('解析用戶數據錯誤:', e);
        }
        
        console.log('直接驗證詳細結果:', {
          tokenExists: !!token,
          tokenLength: token?.length,
          userDataExists: !!userStr,
          username: userData?.username
        });
        
        // 修改驗證邏輯：只要有token和用戶數據就認為有效
        // 完全避免前端令牌有效性驗證，交由後端處理
        if (token && userStr) {
          // 更新內部狀態
          updateAuthState();
          setVerifiedAuth(true);
          console.log('直接驗證成功，允許訪問受保護路由');
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
  }, [isAuthenticated, stateAuthenticated, hasLoginTimestamp, hasLocalAuth, verifiedAuth]);

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
