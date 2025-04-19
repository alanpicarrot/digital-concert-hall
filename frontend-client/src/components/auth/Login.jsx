import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateAuthState } = useAuth();
  
  // 使用 useEffect 來減少不必要的 console 輸出
  useEffect(() => {
    // 更詳細地記錄登入頁面從哪裡進入
    console.log('登入頁面加載，來源路徑:', location.pathname);
    console.log('路由參數:', location.search);
    console.log('路由狀態:', location.state);
  }, [location.pathname, location.search, location.state]);
  
  // 檢查是否有來自其他頁面的重定向
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');
  
  // 確保重定向正確，避免循環
  const [from, setFrom] = useState('/');
  const [fromOrderNumber, setFromOrderNumber] = useState(null);
  const redirectAfterLogin = location.state?.redirectAfterLogin === true;
  
  useEffect(() => {
    console.log('重定向後登入標記:', redirectAfterLogin ? '是' : '否');
  }, [redirectAfterLogin]);
  
  // 決定重定向目標頁面的邏輯
  useEffect(() => {
    // 偵測來源並設置適當的重定向目標
    let logMessage = '';
    
    // 先判斷是否從購物車來直接設置購物車路徑
    if (location.state?.from === '/cart') {
      logMessage = '從購物車重定向來的登入';
      setFrom('/cart');
    }
    // 從結帳頁面來的重定向
    else if (location.state?.from && typeof location.state.from === 'string' && location.state.from.includes('/checkout/')) {
      // 從 URL 中提取訂單號
      const pathParts = location.state.from.split('/');
      if (pathParts.length >= 3) {
        const orderNumber = pathParts[2];
        setFromOrderNumber(orderNumber);
        logMessage = `從結帳頁面重定向，訂單號: ${orderNumber}`;
        setFrom(location.state.from);
      }
    } 
    // 处理其他方式的路徑存储
    else if (location.state?.from?.pathname && location.state.from.pathname.includes('/checkout/')) {
      // 從 URL 中提取訂單號
      const pathParts = location.state.from.pathname.split('/');
      if (pathParts.length >= 3) {
        const orderNumber = pathParts[2]; // 取得 orderNumber
        setFromOrderNumber(orderNumber);
        logMessage = `從結帳頁面重定向，訂單號: ${orderNumber}`;
        setFrom(location.state.from.pathname);
      }
    }
    // 如果有URL查詢參數的重定向
    else if (redirectUrl) {
      // 確保不是登入相關頁面
      if (redirectUrl.includes('/login') || redirectUrl.includes('/auth/login')) {
        logMessage = `避免重定向到登入頁面循環: ${redirectUrl}`;
        setFrom('/');
      } else if (redirectUrl === 'cart') {
        // 如果是從購物車頁面來的重定向，登入成功後回到購物車
        setFrom('/cart');
      } else {
        setFrom(redirectUrl);
      }
    } 
    // 判斷其他形式的狀態存储
    else if (location.state?.from?.pathname) {
      setFrom(location.state.from.pathname);
    } else if (location.state?.from && typeof location.state.from === 'string') {
      setFrom(location.state.from);
    }
    
    // 僅當有需要記錄的訊息時才記錄
    if (logMessage) {
      console.log(logMessage);
    }
  }, [location.state, redirectUrl]);
  
  // 最後記錄最終將要重定向到哪裡
  useEffect(() => {
    console.log('登入成功後將重定向到:', from);
    console.log('登入頁面 - 設定重定向到:', from);
  }, [from]);

  const { username, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('請提供用戶名和密碼');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // 使用 useAuth 的 login 方法登入
      // 注意：包裝控制台輸出的日誌信息，減少非必要的重複記錄
      console.group('登入流程');
      console.log('嘗試登入用戶:', username);
      
      const result = await login(username, password);
      
      if (!result.success) {
        console.error('登入失敗:', result.message);
        console.groupEnd();
        throw new Error(result.message || '登入失敗');
      }
      
      console.log('登入成功，狀態已更新');
      
      // 確保認證狀態更新
      updateAuthState();
      
      // 登入成功，準備重定向
      console.log('登入成功，準備重定向到:', from);
      
      // 增強的重定向處理
      try {
        // 如果有訂單號，則直接導到結帳頁面，並添加認證狀態
        if (fromOrderNumber) {
          console.log('登入成功後返回結帳，訂單號:', fromOrderNumber);
          navigate(`/checkout/${fromOrderNumber}`, { 
            replace: true, 
            state: { authenticated: true } 
          });
          return;
        }

        // 支援 URL 解碼，避免特殊字符問題
        let decodedPath = from;
        if (from.indexOf('%2F') !== -1 || from.indexOf('%3A') !== -1) {
          decodedPath = decodeURIComponent(from);
        }
        
        // 使用日誌組來減少單獨的控制台輸出
        console.group('重定向處理');
        console.log('解碼後的路徑:', decodedPath);
        
        // 再次檢查防止重定向到登入頁面
        if (decodedPath.includes('/login') || decodedPath.includes('/auth/login')) {
          console.log('防止重定向循環，轉至首頁');
          console.groupEnd();
          navigate('/', { replace: true });
          return;
        }

        // 特別處理從購物車來的登入
        if (decodedPath === '/cart' || location.state?.from === '/cart' || location.state?.redirectAfterLogin) {
          console.log('從購物車返回處理');

          // 登入成功後確保先更新全局登入狀態
          updateAuthState();
          
          // 添加成功訊息提示
          alert('登入成功，正在返回購物車...');
          
          // 使用更長的延遲確保登入狀態完全更新
          setTimeout(() => {
            navigate('/cart', { 
              replace: true, 
              state: { 
                authenticated: true,
                loginTimestamp: new Date().getTime(),
                direct: true,
                fromLogin: true
              } 
            });
          }, 1500);
          console.groupEnd();
          return;
        }
        
        // 處理各種路徑類型的重定向
        if (decodedPath.startsWith('/')) {
          console.log('導航至絕對路徑');
          navigate(decodedPath, { replace: true, state: { authenticated: true } });
        } else if (decodedPath.startsWith('http')) {
          console.log('外部鏈接重定向至首頁');
          navigate('/', { replace: true });
        } else {
          console.log('導航至相對路徑');
          navigate('/' + decodedPath, { replace: true, state: { authenticated: true } });
        }
        console.groupEnd();
      } catch (e) {
        console.error('重定向錯誤:', e);
        // 重定向發生錯誤時，預設導到首頁
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const resMessage = error.message || '登入失敗，請檢查您的憑證';
      setError(resMessage);
    } finally {
      console.groupEnd(); // 結束日誌組
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">登入您的帳號</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              還沒有帳號？立即註冊
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-100 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用戶名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={onChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="用戶名"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={onChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="密碼"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                記住我
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                忘記密碼？
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? '登入中...' : '登入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;