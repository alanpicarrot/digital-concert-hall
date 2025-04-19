import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { initMockDataDetection, onMockDataUsed } from './utils/mockDataUtils';
import './App.css';

function App() {
  useEffect(() => {
    // 初始化模擬數據偵測
    initMockDataDetection();
    
    // 監聽模擬數據使用事件
    const unsubscribe = onMockDataUsed((detail) => {
      console.log(`[App] 模擬數據使用通知:`, detail);
      // 這裡可以添加顏色標記或其他UI提示
    });
    
    return () => {
      // 清理監聽器
      unsubscribe();
    };
  }, []);
  
  return (
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;