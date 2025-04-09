# 數位音樂廳專案 - 代碼改進詳情

## 1. API 配置修復

### 端口統一

將所有後端 API 端口從 8081 統一改為 8080：

```diff
- const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
+ const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

### 環境變量更新

更新了前端環境變量文件：

```diff
- REACT_APP_API_URL=http://localhost:8081
+ REACT_APP_API_URL=http://localhost:8080
```

## 2. 添加的新組件

### ErrorBoundary 組件

```jsx
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕獲到錯誤:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 p-6">
              <h2 className="text-2xl font-bold text-white">出現意外錯誤</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                很抱歉，應用程式發生了錯誤。我們的技術團隊已經收到此問題的通知，並正在處理。
              </p>
              
              <div className="bg-gray-50 p-4 rounded mb-4 overflow-auto max-h-40">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  重新整理
                </button>
                
                <Link
                  to="/"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Home size={16} className="mr-2" />
                  返回首頁
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Toast 通知組件

```jsx
import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// 定義不同通知類型的樣式
const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <Check className="text-green-500" size={20} />,
    iconBg: 'bg-green-100',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="text-red-500" size={20} />,
    iconBg: 'bg-red-100',
    title: 'text-red-800',
    message: 'text-red-700'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertCircle className="text-amber-500" size={20} />,
    iconBg: 'bg-amber-100',
    title: 'text-amber-800',
    message: 'text-amber-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="text-blue-500" size={20} />,
    iconBg: 'bg-blue-100',
    title: 'text-blue-800',
    message: 'text-blue-700'
  }
};

const Toast = ({ type = 'info', title, message, onClose, duration = 5000, showProgress = true }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const style = toastStyles[type] || toastStyles.info;

  // 控制通知的顯示和隱藏
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // 等待淡出動畫完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 控制進度條的減少
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, showProgress]);

  // 手動關閉通知
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed top-4 right-4 max-w-md z-50 transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      <div className={`rounded-lg shadow-md border ${style.bg} ${style.border} p-4`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-2 mr-3`}>
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            {title && <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>}
            {message && <p className={`text-sm mt-1 ${style.message}`}>{message}</p>}
            
            {/* 進度條 */}
            {showProgress && (
              <div className="h-1 w-full bg-gray-200 rounded mt-2">
                <div 
                  className={`h-1 rounded transition-all duration-100 ease-linear ${
                    type === 'success' ? 'bg-green-500' :
                    type === 'error' ? 'bg-red-500' :
                    type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
          <button 
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### StepProgress 組件

```jsx
import React from 'react';
import { Check } from 'lucide-react';

const StepProgress = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          // 計算每個步驟的狀態
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <li 
              key={index} 
              className={`flex items-center ${isLast ? '' : 'w-full'}`}
            >
              <div className="flex flex-col items-center">
                {/* 步驟圖標 */}
                <div 
                  className={`z-10 flex items-center justify-center w-8 h-8 rounded-full 
                    ${isComplete ? 'bg-indigo-600 text-white' : 
                      isActive ? 'border-2 border-indigo-600 bg-white text-indigo-600' : 
                      'border-2 border-gray-300 bg-white text-gray-300'}`}
                >
                  {isComplete ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* 步驟標題 */}
                <div className={`mt-2 text-xs sm:text-sm text-center ${
                  isActive ? 'text-indigo-600 font-medium' : 
                  isComplete ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
              </div>
              
              {/* 連接線 */}
              {!isLast && (
                <div className={`w-full h-0.5 mx-2 sm:mx-4 ${
                  isComplete ? 'bg-indigo-600' : 'bg-gray-300'
                }`}></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepProgress;
```

### ConcertHistory 組件

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import storageService from '../../services/storageService';
import SimplePlaceholder from '../ui/SimplePlaceholder';

const ConcertHistory = ({ limit = 4, className = '' }) => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加載瀏覽歷史
  useEffect(() => {
    setLoading(true);
    
    try {
      const history = storageService.history.getConcerts(limit);
      setConcerts(history);
    } catch (error) {
      console.error('Failed to load concert history:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 如果沒有歷史記錄
  if (!loading && concerts.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <History size={18} className="mr-2 text-indigo-500" />
          <h2 className="text-lg font-semibold">最近瀏覽</h2>
        </div>

        {concerts.length > 0 && (
          <button 
            onClick={() => storageService.history.clear()}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            清除歷史
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {concerts.map((concert, index) => (
            <Link
              key={index}
              to={`/concerts/${concert.id}`}
              className="block relative group overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {concert.posterUrl ? (
                <img
                  src={concert.posterUrl}
                  alt={concert.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <SimplePlaceholder
                  width="100%"
                  height={128}
                  text={concert.title}
                  className="w-full h-32 group-hover:opacity-90 transition-opacity"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-2 text-white">
                  <h3 className="text-sm font-medium line-clamp-1">{concert.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs opacity-80">
                      {new Date(concert.timestamp).toLocaleDateString()}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertHistory;
```

## 3. 新增的服務

### 存儲服務 (storageService.js)

```javascript
/**
 * 存儲服務 - 用於在 localStorage 和 sessionStorage 中持久化數據
 * 提供統一的存取接口，支持對象序列化和自動過期
 */

// 默認前綴，避免命名衝突
const DEFAULT_PREFIX = 'dch:';

/**
 * 本地存儲服務
 */
const localStorageService = {
  /**
   * 設置 localStorage 項，支持對象和過期時間
   * @param {string} key - 存儲鍵名
   * @param {any} value - 存儲值，可以是任何 JSON 可序列化的值
   * @param {object} options - 選項
   * @param {string} options.prefix - 自定義前綴
   * @param {number} options.expiry - 過期時間（毫秒），如果未提供則永不過期
   */
  set: (key, value, options = {}) => {
    try {
      const prefix = options.prefix || DEFAULT_PREFIX;
      const fullKey = `${prefix}${key}`;
      
      // 如果提供了過期時間，添加到存儲對象中
      const storageObj = {
        value,
        ...(options.expiry && { expiry: Date.now() + options.expiry })
      };
      
      localStorage.setItem(fullKey, JSON.stringify(storageObj));
      return true;
    } catch (error) {
      console.error('localStorage 設置失敗:', error);
      return false;
    }
  },
  
  // ... 其他方法 ...
};

/**
 * 購物車存儲
 */
const cartStorage = {
  /**
   * 保存購物車
   * @param {Array} items - 購物車項目數組
   */
  saveCart: (items) => {
    return localStorageService.set('cart', items);
  },
  
  /**
   * 獲取購物車
   * @returns {Array} 購物車項目數組
   */
  getCart: () => {
    return localStorageService.get('cart', { defaultValue: [] });
  },
  
  /**
   * 清空購物車
   */
  clearCart: () => {
    return localStorageService.remove('cart');
  }
};

/**
 * 曾經瀏覽過的音樂會歷史記錄
 */
const browsingHistory = {
  /**
   * 添加一個音樂會到瀏覽歷史
   * @param {Object} concert - 音樂會信息
   */
  addConcert: (concert) => {
    if (!concert || !concert.id) return false;
    
    // 獲取現有歷史
    const history = localStorageService.get('history:concerts', { defaultValue: [] });
    
    // 檢查是否已存在
    const existingIndex = history.findIndex(item => item.id === concert.id);
    if (existingIndex !== -1) {
      // 移除舊記錄
      history.splice(existingIndex, 1);
    }
    
    // 添加到歷史頂部
    history.unshift({
      id: concert.id,
      title: concert.title,
      posterUrl: concert.posterUrl,
      timestamp: Date.now()
    });
    
    // 保留最近的20條記錄
    const trimmedHistory = history.slice(0, 20);
    
    // 保存更新的歷史
    return localStorageService.set('history:concerts', trimmedHistory);
  },
  
  // ... 其他方法 ...
};

// 導出主要服務
const storageService = {
  local: localStorageService,
  session: sessionStorageService,
  preferences: userPreferences,
  cart: cartStorage,
  history: browsingHistory
};

export default storageService;
```

## 4. 主要改進

### 購物車服務

```diff
// 獲取購物車數據
const getCart = () => {
-  const cartData = localStorage.getItem(CART_STORAGE_KEY);
-  return cartData ? JSON.parse(cartData) : { items: [], total: 0 };
+  return storageService.cart.getCart() || { items: [], total: 0 };
};

// 保存購物車數據並發出自定義事件
const saveCart = (cart) => {
-  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
+  storageService.cart.saveCart(cart);
  
  // 發出自定義事件，通知購物車數據已更新
  const event = new CustomEvent('cartUpdated', { detail: cart });
  window.dispatchEvent(event);
  
  return cart;
};

// 清空購物車
const clearCart = () => {
+  storageService.cart.clearCart();
  return saveCart({ items: [], total: 0 });
};
```

### App.js 改進

```diff
-import React, { useEffect } from 'react';
+import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
+import { ToastProvider } from './contexts/ToastContext';
+import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
-  // 在應用程序加載時清除所有認證狀態，確保初始狀態是登出的
-  useEffect(() => {
-    console.log('App 組件加載 - 清除所有認證狀態');
-    // 清除所有認證相關的 localStorage
-    localStorage.removeItem('token');
-    localStorage.removeItem('user');
-    localStorage.removeItem('_forceUpdate');
-    // 清除任何可能的購物車或結帳信息
-    sessionStorage.removeItem('checkoutInfo');
-    
-    console.log('初始化: 所有認證狀態已清除，用戶需要登入');
-  }, []);

  return (
+    <ErrorBoundary>
+      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
+      </ToastProvider>
+    </ErrorBoundary>
  );
}

export default App;
```

### 結帳頁面增強

```diff
import { Loader2, CreditCard, ShoppingBag, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import authService from '../../services/authService';
import orderService from '../../services/orderService';
+import { useToast } from '../../contexts/ToastContext';
+import StepProgress from '../../components/ui/StepProgress';

const CheckoutPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
+  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [directCheckout, setDirectCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... 其他代碼 ...

  // 點擊付款按鈕
  setPaymentLoading(true);
+  toast.showInfo('準備付款', '正在將您導向付款頁面...');
  
  // 如果是直接購票，需要先在後端創建一個訂單

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">訂單確認與付款</h1>
          <div className="text-gray-600 text-sm">確認以下訂單資訊並進行付款</div>
        </div>
        
+        {/* 購票流程步驟指引 */}
+        <div className="mb-6">
+          <StepProgress
+            steps={[
+              { label: '選擇票券' },
+              { label: '確認訂單' },
+              { label: '付款' },
+              { label: '完成' }
+            ]}
+            currentStep={1}
+          />
+        </div>
  );
};
```

### ConcertDetailPage 音樂會瀏覽歷史

```diff
import concertService from "../../services/concertService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
+import storageService from "../../services/storageService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";

// ...

setConcert(concertDetails);
        
+// 將音樂會添加到瀏覽歷史
+storageService.history.addConcert({
+  id: concertData.id,
+  title: concertData.title,
+  posterUrl: concertData.posterUrl
+});
```

### HomePage 添加瀏覽歷史組件

```diff
+import ConcertHistory from "../../components/concert/ConcertHistory";

// ...

+{/* 最近瀏覽的音樂會 */}
+<section className="py-8">
+  <ConcertHistory className="max-w-6xl mx-auto px-4" />
+</section>
```
