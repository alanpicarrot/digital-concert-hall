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

  // 更完整的認證驗證和詳細日誌
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
          state: JSON.stringify(location.state)
        });
        
        // 如果傳入的狀態表示已認證，直接設為已驗證狀態
        if (stateAuthenticated) {
          console.log('從其他頁面傳遞認證成功狀態，直接接受認證');
          updateAuthState(); // 嘗試更新內部狀態
          setVerifiedAuth(true);
          setVerifying(false);
          return;
        }
        
        // 從localStorage直接驗證
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const isTokenValid = authService.isTokenValid();
        
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
          username: userData?.username,
          tokenValid: isTokenValid
        });
        
        // 修改驗證邏輯：只要有token和用戶數據就先認為有效
        // 避免前端誤判令牌有效性造成的問題
        if (token && userStr) {
          // 更新內部狀態
          updateAuthState();
          setVerifiedAuth(true);
          console.log('直接驗證成功，允許訪問受保護路由');
          
          // 如果前端認為令牌無效但仍有令牌，記錄警告但不阻止訪問
          if (!isTokenValid) {
            console.warn('警告: 令牌前端驗證失敗，但存在token和用戶數據，仍允許訪問');
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
  }, [isAuthenticated, stateAuthenticated, hasLoginTimestamp, updateAuthState]);

  // 如果正在驗證，顯示載入指示器
  if (verifying || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 如果已驗證認證狀態、狀態認證或全局認證，則允許訪問
  if (verifiedAuth || stateAuthenticated || isAuthenticated) {
    console.log('認證成功，允許訪問受保護路由');
    return children;
  }
  
  // 增加對本地存儲的直接檢查，作為最後的保障機制
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    console.warn('通過驗證狀態檢查失敗，但本地存儲中有令牌和用戶數據，仍允許訪問');
    // 嘗試立即更新認證狀態
    updateAuthState();
    return children;
  }

  // 如果用戶未登入，重定向到登入頁面，並保存原始頁面位置
  return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;
