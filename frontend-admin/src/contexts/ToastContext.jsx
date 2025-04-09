import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

// 創建通知上下文
const ToastContext = createContext();

// 生成唯一ID
const generateId = () => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// 提供者組件
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // 添加通知
  const addToast = useCallback((toast) => {
    const id = toast.id || generateId();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  // 顯示成功通知
  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({ 
      type: 'success', 
      title, 
      message, 
      ...options 
    });
  }, [addToast]);

  // 顯示錯誤通知
  const showError = useCallback((title, message, options = {}) => {
    return addToast({ 
      type: 'error', 
      title, 
      message, 
      ...options 
    });
  }, [addToast]);

  // 顯示警告通知
  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({ 
      type: 'warning', 
      title, 
      message, 
      ...options 
    });
  }, [addToast]);

  // 顯示信息通知
  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({ 
      type: 'info', 
      title, 
      message, 
      ...options 
    });
  }, [addToast]);

  // 移除通知
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 清除所有通知
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 提供的上下文值
  const value = {
    addToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 渲染所有通知 */}
      <div className="toast-container">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration || 5000}
            showProgress={toast.showProgress !== false}
            onClose={() => removeToast(toast.id)}
            style={{ top: `${(index * 4) + 1}rem` }} // 堆疊通知
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
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;