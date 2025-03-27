import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';

const AuthNav = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // 監聽 localStorage 中的用戶資訊變化
    const handleStorageChange = () => {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
    };

    // 初始化時檢查用戶狀態
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // 添加事件監聽器，點擊其他地方時關閉下拉選單
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/');
    // 發射儲存事件，通知其他組件用戶已登出
    window.dispatchEvent(new Event('storage'));
    // 可能需要重新加載頁面或更新應用狀態
    window.location.reload();
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="flex items-center">
      {currentUser ? (
        <div className="relative user-dropdown">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-white hover:text-indigo-200 focus:outline-none"
          >
            <span className="hidden md:inline-block mr-1 font-medium">{currentUser.username}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-gray-700">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                我的資料
              </Link>
              <Link
                to="/user/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                我的訂單
              </Link>
              <Link
                to="/user/tickets"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                我的票券
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                登出
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-white hover:text-indigo-200 text-sm font-medium"
          >
            登入
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            註冊
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthNav;
