import React, { useState } from 'react';
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
  
  // 更詳細地記錄登入頁面從哪裡進入
  console.log('登入頁面加載，來源路徑:', location.pathname);
  console.log('路由參數:', location.search);
  console.log('路由狀態:', location.state);
  
  // 檢查是否有來自其他頁面的重定向
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');
  
  // 確保重定向正確，避免循環
  let from = '/';
  let fromOrderNumber = null;
  const redirectAfterLogin = location.state?.redirectAfterLogin === true;
  
  console.log('重定向後登入標記:', redirectAfterLogin ? '是' : '否');
  
  // 先判斷是否從購物車來直接設置購物車路徑
  if (location.state?.from === '/cart') {
    console.log('從購物車重定向來的登入');
    from = '/cart';
  }
  // 從結帳頁面來的重定向
  else if (location.state?.from && typeof location.state.from === 'string' && location.state.from.includes('/checkout/')) {
    // 從 URL 中提取訂單號
    const pathParts = location.state.from.split('/');
    if (pathParts.length >= 3) {
      fromOrderNumber = pathParts[2]; // 取得 orderNumber
      console.log('從結帳頁面重定向，訂單號:', fromOrderNumber);
      from = location.state.from;
    }
  } 
  // 处理其他方式的路徑存储
  else if (location.state?.from?.pathname && location.state.from.pathname.includes('/checkout/')) {
    // 從 URL 中提取訂單號
    const pathParts = location.state.from.pathname.split('/');
    if (pathParts.length >= 3) {
      fromOrderNumber = pathParts[2]; // 取得 orderNumber
      console.log('從結帳頁面重定向，訂單號:', fromOrderNumber);
      from = location.state.from.pathname;
    }
  }
  // 如果有URL查詢參數的重定向
  else if (redirectUrl) {
    // 確保不是登入相關頁面
    if (redirectUrl.includes('/login') || redirectUrl.includes('/auth/login')) {
      console.log('避免重定向到登入頁面循環:', redirectUrl);
      from = '/';
    } else if (redirectUrl === 'cart') {
      // 如果是從購物車頁面來的重定向，登入成功後回到購物車
      from = '/cart';
    } else {
      from = redirectUrl;
    }
  } 
  // 判斷其他形式的狀態存储
  else if (location.state?.from?.pathname) {
    from = location.state.from.pathname;
  } else if (location.state?.from && typeof location.state.from === 'string') {
    from = location.state.from;
  }
  
  // 最後記錄最終將要重定向到哪裡
  console.log('登入成功後將重定向到:', from);
  
  console.log('登入頁面 - 設定重定向到:', from);

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
      console.log('===== 開始登入處理 =====');
      console.log('嘗試登入用戶:', username);
      
      console.log('提交登入表單，開始調用登入函數');
      const result = await login(username, password);
      
      console.log('登入函數返回結果:', result);
      
      if (!result.success) {
        console.error('登入失敗:', result.message);
        throw new Error(result.message || '登入失敗');
      }
      
      console.log('登入成功，結果:', result);
      
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
        
        console.log('解碼後的重定向路徑:', decodedPath);
        
        // 再次檢查防止重定向到登入頁面
        if (decodedPath.includes('/login') || decodedPath.includes('/auth/login')) {
          console.log('防止重定向循環，轉至首頁');
          navigate('/', { replace: true });
          return;
        }

        // 特別處理從購物車來的登入
        if (decodedPath === '/cart' || location.state?.from === '/cart' || location.state?.redirectAfterLogin) {
          console.log('從購物車來的登入，登入成功後返回購物車');
          console.log('從購物車跳轉登入標記:', location.state?.redirectAfterLogin);

          // 登入成功後確保先更新全局登入狀態
          updateAuthState();
          
          // 添加成功訊息提示
          alert('登入成功，正在返回購物車...');
          
          // 再次確認登入成功後的令牌狀態
          const recheckToken = localStorage.getItem('token');
          const recheckUser = localStorage.getItem('user');
          console.log('將要重定向到購物車，確認認證狀態:', {
            tokenExists: !!recheckToken,
            userExists: !!recheckUser
          });
          
          // 使用更長的延遲確保登入狀態完全更新
          console.log('將在1500ms後重定向到購物車');
          setTimeout(() => {
            navigate('/cart', { 
              replace: true, 
              state: { 
                authenticated: true,
                loginTimestamp: new Date().getTime(), // 包含登入時間戳停止系統綜合缓存
                direct: true, // 添加直接導向標記
                fromLogin: true // 添加登入來源標記
              } 
            });
          }, 1500);
          return;
        }
        
        if (decodedPath.startsWith('/')) {
          // 如果是完整的URL路徑，則直接導航
          console.log('導航至絕對路徑:', decodedPath);
          navigate(decodedPath, { replace: true, state: { authenticated: true } });
        } else if (decodedPath.startsWith('http')) {
          // 如果是外部鏈接，重定向到首頁
          console.log('檢測到外部鏈接，重定向至首頁');
          navigate('/', { replace: true });
        } else {
          // 否則作為相對路徑處理
          console.log('導航至相對路徑:', '/' + decodedPath);
          navigate('/' + decodedPath, { replace: true, state: { authenticated: true } });
        }
      } catch (e) {
        console.error('Redirect error:', e);
        // 重定向發生錯誤時，預設導到首頁
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const resMessage = error.message || '登入失敗，請檢查您的憑證';
      setError(resMessage);
    } finally {
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