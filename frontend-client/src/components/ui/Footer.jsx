import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-indigo-900 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">數位音樂廳</h3>
          <p className="text-sm text-gray-300">
            為您提供最優質的線上音樂會與直播體驗，讓您隨時隨地欣賞世界級表演。
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">關於我們</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/about"
                className="text-sm text-gray-300 hover:text-white"
              >
                關於數位音樂廳
              </Link>
            </li>
            <li>
              <Link
                to="/artists"
                className="text-sm text-gray-300 hover:text-white"
              >
                合作藝術家
              </Link>
            </li>
            <li>
              <Link
                to="/news"
                className="text-sm text-gray-300 hover:text-white"
              >
                媒體資訊
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm text-gray-300 hover:text-white"
              >
                聯絡我們
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">幫助中心</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/faq"
                className="text-sm text-gray-300 hover:text-white"
              >
                常見問題
              </Link>
            </li>
            <li>
              <Link
                to="/ticket-help"
                className="text-sm text-gray-300 hover:text-white"
              >
                購票說明
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-sm text-gray-300 hover:text-white"
              >
                服務條款
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-sm text-gray-300 hover:text-white"
              >
                隱私政策
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">訂閱電子報</h3>
          <p className="text-sm text-gray-300 mb-3">
            獲取最新音樂會訊息和獨家優惠
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="您的電子郵件"
              className="px-3 py-2 text-gray-800 rounded-l focus:outline-none flex-grow"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r">
              訂閱
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
