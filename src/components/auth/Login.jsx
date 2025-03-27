import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // 檢查是否有來自其他頁面的重定向
  const from = location.state?.from?.pathname || '/';

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
      // 呼叫登入API
      console.log('Attempting login with:', { username, password: '******' });
      const response = await AuthService.login(username, password);
      console.log('Login successful! Response:', { ...response, accessToken: response.accessToken ? '[REDACTED]' : null });
      
      // 登入成功，導航到重定向的頁面或預設頁面
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      // 輸出詳細的錯誤信息
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setError(resMessage || '登入失敗，請檢查您的憑證');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">登入您的帳號</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              還沒有帳號？立即註冊
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-100 p-4">
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
