import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 私有路由元件，用於保護需要登入的頁面
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, updateAuthState } = useAuth();
  const location = useLocation();

  // 偵測從其他頁面傳遞的認證狀態
  const stateAuthenticated = location.state?.authenticated;

  // 使用useState跟踪認證驗證狀態
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // 直接檢查localStorage中的令牌和用户數據
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const hasLocalAuth = !!(token && userStr);

  useEffect(() => {
    const verifyAuthentication = () => {
      // 簡化的認證檢查邏輯
      console.log("PrivateRoute - 認證檢查:", {
        contextAuth: isAuthenticated,
        stateAuth: stateAuthenticated,
        hasLocalAuth: hasLocalAuth,
        pathname: location.pathname,
      });

      // 如果AuthContext中已經是認證狀態，直接允許
      if (isAuthenticated) {
        console.log("AuthContext 中已認證，允許訪問");
        setAuthCheckComplete(true);
        return;
      }

      // 如果頁面狀態中標記為已認證，直接允許
      if (stateAuthenticated) {
        console.log("頁面狀態標記已認證，允許訪問");
        setAuthCheckComplete(true);
        return;
      }

      // 如果localStorage中有認證數據，嘗試恢復認證狀態
      if (hasLocalAuth) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && userData.username) {
            console.log("從localStorage恢復認證狀態:", userData.username);
            // 更新AuthContext狀態
            updateAuthState();
            setAuthCheckComplete(true);
            return;
          }
        } catch (e) {
          console.error("解析localStorage用戶數據失敗:", e);
        }
      }

      // 如果都沒有認證數據，標記檢查完成（將被重定向）
      console.log("未找到有效認證，將重定向到登入頁面");
      setAuthCheckComplete(true);
    };

    // 如果AuthContext還在加載中，等待加載完成
    if (!loading) {
      verifyAuthentication();
    }
  }, [
    isAuthenticated,
    stateAuthenticated,
    hasLocalAuth,
    updateAuthState,
    location.pathname,
    loading,
    token,
    userStr,
  ]);

  // 如果AuthContext正在加載或認證檢查未完成，顯示載入指示器
  if (loading || !authCheckComplete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 檢查是否有任何形式的認證
  const isAuthorized = isAuthenticated || stateAuthenticated || hasLocalAuth;

  if (isAuthorized) {
    console.log("認證檢查通過，允許訪問受保護路由");
    return children;
  }

  // 如果用戶未登入，重定向到登入頁面，並保存原始頁面位置
  console.log("認證檢查失敗，重定向到登入頁面");
  return (
    <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  );
};

export default PrivateRoute;
