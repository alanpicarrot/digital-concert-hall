import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-indigo-900 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="mr-2">🎵</span> 數位音樂廳
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-indigo-200">
            首頁
          </Link>
          <Link to="/concerts" className="hover:text-indigo-200">
            音樂會
          </Link>
          <Link to="/tickets" className="hover:text-indigo-200">
            購票區
          </Link>
          <Link to="/live" className="hover:text-indigo-200">
            直播
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-white hover:text-indigo-200">
            <span className="mr-1">🛒</span>
          </Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center text-white hover:text-indigo-200">
                {user.username} <span className="ml-1">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-indigo-100"
                >
                  個人資料
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-gray-800 hover:bg-indigo-100"
                >
                  我的訂單
                </Link>
                <button className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-indigo-100">
                  登出
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                to="/login"
                className="px-3 py-1 rounded text-white hover:text-indigo-200"
              >
                登入
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-700"
              >
                註冊
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
