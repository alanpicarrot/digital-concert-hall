import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminUserService from '../../services/admin/adminUserService';

const RegisterAdminPage = () => {
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
  const [debugInfo, setDebugInfo] = useState('');
  
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
    setDebugInfo('');
    
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
      // 創建請求數據 - 確保添加管理員角色
      const adminData = {
        username,
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
        role: ['admin']  // 確保包含了角色信息
      };
      
      setDebugInfo('開始嘗試創建管理員帳號...');
      
      // 使用 AdminUserService 創建管理員帳號
      const response = await AdminUserService.createAdmin(adminData);
      
      setDebugInfo(prev => `${prev}\n創建結果: ${JSON.stringify(response.data)}`);
      
      // 如果返回訊息包含預設用戶信息
      if (response.data.message && response.data.message.includes('預設用戶')) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
        return;
      }
      
      // 註冊成功後導航到登入頁面
      setMessage('管理員帳號創建成功！正在跳轉到登入頁面...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('管理員註冊錯誤:', error);
      setDebugInfo(prev => `${prev}\n錯誤: ${error.message}`);
      
      // 顯示詳細錯誤信息
      if (error.response) {
        const { status, data } = error.response;
        setDebugInfo(prev => `${prev}\n狀態碼: ${status}\n數據: ${JSON.stringify(data)}`);
        
        // 處理驗證錯誤
        if (data && data.errors) {
          const backendErrors = {};
          for (const [field, message] of Object.entries(data.errors)) {
            backendErrors[field] = message;
          }
          setErrors({ ...errors, ...backendErrors });
        }
        
        // 處理一般錯誤訊息
        if (data && data.message) {
          setMessage(data.message);
          return;
        }
      }
      
      setMessage('創建管理員帳號失敗，請查看調試信息了解詳情');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useTestUser = () => {
    setMessage('將使用預設用戶登入: testuser/password123');
    setTimeout(() => {
      navigate('/auth/login');
    }, 2000);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-4">創建管理員帳號</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          請填寫以下信息以創建具有管理權限的帳號
        </p>
        
        {message && (
          <div className={`mb-6 rounded-md p-3 ${message.includes('成功') || message.includes('預設') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        {debugInfo && (
          <div className="mb-6 rounded-md p-3 bg-gray-100 text-gray-800 text-xs">
            <div>偵錯信息:</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{debugInfo}</pre>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  名字
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  autoComplete="family-name"
                  value={lastName}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="姓氏"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用戶名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="用戶名"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="電子郵件"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="密碼"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                確認密碼
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="確認密碼"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 text-white text-sm font-medium rounded-md ${
              isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? '處理中...' : '創建管理員帳號'}
          </button>
          
          <div className="mt-4 flex flex-col space-y-2">
            <button 
              type="button"
              onClick={useTestUser}
              className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              使用預設用戶 (testuser/password123)
            </button>
            
            <Link 
              to="/auth/login" 
              className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              返回登入頁面
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdminPage;