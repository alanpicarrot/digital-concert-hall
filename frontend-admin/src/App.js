import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminRoutes from "./router/AdminRoutes"; // Corrected path
import { ToastProvider } from "./contexts/ToastContext";
import { setupPreRequestAuth } from "./utils/authPersistUtils";

function App() {
  // 應用啟動時設置全局認證保護
  useEffect(() => {
    // console.log("應用初始化，設置全局認證保護");
    // 檢查本地存儲狀態 (可選保留)
    // const token = localStorage.getItem("adminToken");
    // const userStr = localStorage.getItem("adminUser");
    // console.log("應用啟動狀態檢查:", {
    //   令牌存在: !!token,
    //   用戶數據存在: !!userStr,
    //   令牌預覽: token ? token.substring(0, 10) + "..." : "無",
    // });

    // 設置請求攔截器以確保每個請求都正確包含認證信息
    setupPreRequestAuth(); // 設置請求攔截和定期檢查

    // 增加事件監聽器確保頁面可見性變化時仍然保持認證狀態
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // console.log("頁面變為可見，重新檢查認證狀態");
        // 可以考慮在這裡觸發一次認證狀態檢查，如果需要的話
        // setupPreRequestAuth(); // 或者更輕量級的檢查
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 清除事件監聽器
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <BrowserRouter basename="/">
      <ToastProvider>
        <AuthProvider>
          <AdminRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
