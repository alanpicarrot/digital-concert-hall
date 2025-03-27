import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // 檢查用戶是否有ADMIN角色
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');

  // 登出處理
  const handleLogout = () => {
    AuthService.logout();
    navigate('/auth/login');
  };

  // 如果不是管理員，重定向到登入頁面
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">權限不足</h1>
          <p className="mb-4">您需要管理員權限來訪問此頁面。</p>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              返回首頁
            </button>
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              登入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 側邊導航欄 */}
      <div className="bg-gray-800 text-white w-64 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">數位音樂廳後台</h1>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                控制台
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/concerts"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                音樂會管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/performances"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                演出場次管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/ticket-types"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                票種管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/tickets"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                票券管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                訂單管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`
                }
              >
                用戶管理
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="mb-4">
            <span className="block text-sm">歡迎，{currentUser.username}</span>
            <span className="block text-xs text-gray-400">
              {currentUser.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            登出
          </button>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
