import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/authService';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">我的票券與訂單</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/user/orders" className="bg-indigo-50 hover:bg-indigo-100 rounded-lg p-6 flex flex-col items-center transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-lg font-medium text-indigo-800">我的訂單</span>
            <p className="text-sm text-gray-600 text-center mt-2">查看您的購票訂單</p>
          </Link>
          
          <Link to="/user/tickets" className="bg-emerald-50 hover:bg-emerald-100 rounded-lg p-6 flex flex-col items-center transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span className="text-lg font-medium text-emerald-800">我的票券</span>
            <p className="text-sm text-gray-600 text-center mt-2">查看您的電子票券</p>
          </Link>
        </div>
      </div>
      setUser({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
      });
    }
    
    // 獲取最新的用戶資料
    const fetchUserData = async () => {
      try {
        const response = await AuthService.axiosInstance.get('users/me');
        const userData = response.data;
        setUser({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
        });
      } catch (error) {
        console.error('獲取用戶資料失敗', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setMessage('');
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordMessage('');
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await AuthService.updateProfile(user);
      setMessage(response.data.message || '資料更新成功！');
      
      // 更新本地存儲的用戶資訊
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...currentUser,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          })
        );
      }
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // 驗證密碼
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('兩次輸入的新密碼不一致');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('新密碼至少需要6個字符');
      return;
    }
    
    setLoading(true);
    setPasswordMessage('');
    
    try {
      const response = await AuthService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordMessage(response.data.message || '密碼更新成功！');
      // 清除密碼欄位
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setPasswordMessage(resMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">個人資料</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">基本資料</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                名字
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={user.firstName}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                姓氏
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={user.lastName}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                電子郵件
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? '處理中...' : '更新資料'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">更改密碼</h2>
        
        {passwordMessage && (
          <div className={`mb-4 p-4 rounded-md ${passwordMessage.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {passwordMessage}
          </div>
        )}
        
        <form onSubmit={handlePasswordUpdate}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                當前密碼
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新密碼
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                確認新密碼
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? '處理中...' : '更改密碼'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
