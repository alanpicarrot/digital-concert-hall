import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'bg-indigo-50 text-indigo-800' : 'text-gray-700 hover:bg-gray-50';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左側側邊欄 */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 用戶資訊 */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            {/* 選單 */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/user/profile" 
                    className={`block px-4 py-2 rounded-md ${isActive('/profile')}`}
                  >
                    個人資料
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/orders" 
                    className={`block px-4 py-2 rounded-md ${isActive('/orders')}`}
                  >
                    訂單記錄
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/tickets" 
                    className={`block px-4 py-2 rounded-md ${isActive('/tickets')}`}
                  >
                    我的票券
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/favorites" 
                    className={`block px-4 py-2 rounded-md ${isActive('/favorites')}`}
                  >
                    收藏清單
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/change-password" 
                    className={`block px-4 py-2 rounded-md ${isActive('/change-password')}`}
                  >
                    修改密碼
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* 右側內容 */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
