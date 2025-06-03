import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 圖示 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle size={40} className="text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            頁面不存在
          </h2>
        </div>

        {/* 錯誤描述 */}
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            抱歉，您要訪問的頁面不存在或已被移除。
          </p>
          <p className="text-sm text-gray-500">
            請檢查網址是否正確，或返回首頁重新瀏覽。
          </p>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Home size={20} className="mr-2" />
            返回首頁
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回上一頁
          </button>
        </div>

        {/* 搜尋建議 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center justify-center">
            <Search size={18} className="mr-2" />
            您可能在尋找
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <button
              onClick={() => navigate("/concerts")}
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              音樂會列表
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              購物車
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              個人資料
            </button>
          </div>
        </div>
      </div>

      {/* 頁腳 */}
      <div className="mt-12 text-center text-xs text-gray-500">
        <p>© 2025 數位音樂廳. 版權所有.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
