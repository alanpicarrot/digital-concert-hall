import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Toast from "../components/ui/Toast";
import ToastManager from "../utils/ToastManager"; // 引入 ToastManager

// 創建通知上下文
const ToastContext = createContext();

// 生成唯一ID
const generateId = () =>
  `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// 提供者組件
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [recentToasts, setRecentToasts] = useState(new Set()); // 用於防止重複顯示

  // 使用useRef保存最新的回調函數引用
  const callbacksRef = useRef({});
  // 使用useRef保存最新的recentToasts引用，避免useCallback依賴項問題
  const recentToastsRef = useRef(new Set());

  // 更新recentToastsRef
  useEffect(() => {
    recentToastsRef.current = recentToasts;
  }, [recentToasts]);

  // 檢查是否為重複的Toast（基於type、title和message）
  const isDuplicateToast = useCallback(
    (newToast) => {
      const toastKey = `${newToast.type}-${newToast.title}-${newToast.message}`;

      if (recentToastsRef.current.has(toastKey)) {
        console.log("發現重複的Toast，跳過顯示:", toastKey);
        return true;
      }

      // 將新Toast加入最近顯示的集合，並設置5秒後自動移除
      setRecentToasts((prev) => new Set([...prev, toastKey]));
      setTimeout(() => {
        setRecentToasts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(toastKey);
          return newSet;
        });
      }, 5000); // 延長到5秒，避免快速重複操作時的問題

      return false;
    },
    [] // 移除recentToasts依賴項
  );

  // 添加通知
  const addToast = useCallback(
    (toast) => {
      // 檢查是否為重複Toast
      if (isDuplicateToast(toast)) {
        return null;
      }

      const id = toast.id || generateId();
      const newToast = { ...toast, id };

      setToasts((prev) => {
        // 限制最多同時顯示5個Toast
        const updatedToasts = [...prev, newToast];
        if (updatedToasts.length > 5) {
          return updatedToasts.slice(-5);
        }
        return updatedToasts;
      });

      return id;
    },
    [isDuplicateToast]
  );

  // 顯示成功通知
  const showSuccess = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  // 顯示錯誤通知
  const showError = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "error",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  // 顯示警告通知
  const showWarning = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  // 顯示信息通知
  const showInfo = useCallback(
    (title, message, options = {}) => {
      return addToast({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [addToast]
  );

  // 移除通知
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 清除所有通知
  const clearToasts = useCallback(() => {
    setToasts([]);
    setRecentToasts(new Set()); // 同時清除重複檢查記錄
  }, []);

  // 更新回調函數引用
  useEffect(() => {
    callbacksRef.current = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    };
  });

  // 提供的上下文值
  const value = {
    addToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
  };

  // 將 Toast 回調註冊到 ToastManager，使非組件環境也能顯示通知
  useEffect(() => {
    console.log("Toast 回調已註冊");

    // 創建包裝函數，使用最新的回調引用
    const wrappedCallbacks = {
      success: (...args) => callbacksRef.current.success?.(...args),
      error: (...args) => callbacksRef.current.error?.(...args),
      warning: (...args) => callbacksRef.current.warning?.(...args),
      info: (...args) => callbacksRef.current.info?.(...args),
    };

    // 將包裝的回調函數註冊到全局 ToastManager 中
    ToastManager.registerCallbacks(wrappedCallbacks);

    // 將 ToastManager 實例設置到全局窗口對象
    window.ToastManager = ToastManager;

    console.log("Toast 系統已初始化並與全局 ToastManager 連接");

    return () => {
      // 清理回調，避免內存洩漏
      if (window.ToastManager) {
        window.ToastManager.registerCallbacks({
          success: null,
          error: null,
          warning: null,
          info: null,
        });
      }
    };
  }, []); // 移除所有依賴項，讓此effect只在組件掛載時執行一次

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 渲染所有通知 */}
      <div className="toast-container fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration || 5000}
            showProgress={toast.showProgress !== false}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 自定義 Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
