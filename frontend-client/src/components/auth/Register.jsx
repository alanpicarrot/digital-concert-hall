import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const { username, email, password, confirmPassword, firstName, lastName } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // 清除相應欄位的錯誤
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!username.trim()) newErrors.username = '用戶名必填';
    if (!email.trim()) newErrors.email = '電子郵件必填';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '電子郵件格式不正確';
    
    if (!password) newErrors.password = '密碼必填';
    else if (password.length < 6) newErrors.password = '密碼至少需要6個字符';
    
    if (password !== confirmPassword) newErrors.confirmPassword = '兩次密碼不一致';
    
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    // 確保所有必要欄位都有值
    if (!username || !email || !password) {
      setErrors({
        ...errors,
        username: username ? '' : '用戶名必填',
        email: email ? '' : '電子郵件必填',
        password: password ? '' : '密碼必填'
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 捕捉和輸出註冊請求的詳細信息
      console.log('Sending registration request with data:', {
        username,
        email,
        password,
        firstName,
        lastName,
        role: ['user']
      });

      const response = await AuthService.register(
        username,
        email,
        password,
        firstName,
        lastName
      );
      
      console.log('Registration response:', response);
      
      // 註冊成功後導航到登入頁面
      setMessage('註冊成功！正在跳轉到登入頁面...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      
      // 輸出更詳細的錯誤信息
      if (error.response) {
        // 服務器已响應但有錯誤
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // 查看更詳細的驗證錯誤信息
        if (error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
          
          // 將後端的驗證錯誤題示給用戶
          const backendErrors = {};
          for (const [field, message] of Object.entries(error.response.data.errors)) {
            backendErrors[field] = message;
          }
          setErrors({ ...errors, ...backendErrors });
        }
        
        if (error.response.data.message) {
          console.error('Error message:', error.response.data.message);
          setMessage(error.response.data.message);
          return;
        }
      } else if (error.request) {
        // 請求已發送但沒有收到回應
        console.error('Error request:', error.request);
      } else {
        // 其他請求設置的問題
        console.error('Error message:', error.message);
      }
      
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage || '註冊失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">註冊新帳號</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              已有帳號？立即登入
            </Link>
          </p>
        </div>
        
        {message && (
          <div className={`rounded-md p-4 ${message.includes('成功') ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.includes('成功') ? (
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
                <p className={`text-sm font-medium ${message.includes('成功') ? 'text-green-800' : 'text-red-800'}`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  名字
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={onChange}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="名字"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  姓氏
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={onChange}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="姓氏"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
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
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={onChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="電子郵件"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                onChange={onChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="確認密碼"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
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
              {isSubmitting ? '處理中...' : '註冊'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
