import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('請輸入您的電子郵件地址');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await AuthService.forgotPassword(email);
      setMessage(response.data.message || '密碼重置郵件已發送，請檢查您的郵箱');
      setIsSuccess(true);
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage || '發送重置郵件失敗，請稍後再試');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">忘記密碼</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的電子郵件地址，我們將向您發送重置密碼的鏈接
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
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件地址
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={handleChange}
              className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="電子郵件地址"
            />
          </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? '處理中...' : '發送重置郵件'}
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

export default ForgotPassword;
