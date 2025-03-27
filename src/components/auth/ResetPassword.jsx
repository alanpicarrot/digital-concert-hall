import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { password, confirmPassword } = formData;
  
  // 檢查是否有令牌
  useEffect(() => {
    if (!token) {
      setMessage('無效的密碼重置鏈接。請重新申請重置密碼。');
    }
  }, [token]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 驗證密碼
    if (password !== confirmPassword) {
      setMessage('兩次輸入的密碼不一致');
      return;
    }
    
    if (password.length < 6) {
      setMessage('密碼至少需要6個字符');
      return;
    }
    
    if (!token) {
      setMessage('無效的密碼重置鏈接。請重新申請重置密碼。');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await AuthService.resetPassword(token, password);
      setMessage(response.data.message || '密碼已成功重置');
      setIsSuccess(true);
      
      // 3秒後導航到登入頁面
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage || '重置密碼失敗，請稍後再試');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">重設密碼</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的新密碼
          </p>
        </div>
        
        {message && (
          <div className={`rounded-md p-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                  {message}
                </p>
                {isSuccess && (
                  <p className="text-sm text-green-700 mt-1">
                    即將跳轉到登入頁面...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                新密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={handleChange}
                disabled={!token || isSuccess}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="新密碼"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                確認密碼
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={handleChange}
                disabled={!token || isSuccess}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="確認密碼"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !token || isSuccess}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting || !token || isSuccess ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? '處理中...' : '重設密碼'}
            </button>
          </div>
          
          <div className="pt-4 text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              返回登入
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
