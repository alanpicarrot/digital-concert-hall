import React from "react";

const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-teal-700 mb-6">404</h1>
      <h2 className="text-3xl font-semibold mb-4">找不到頁面</h2>
      <p className="text-xl text-gray-600 mb-8">
        很抱歉，您要尋找的頁面不存在或已被移除。
      </p>
      <a
        href="/dashboard"
        className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-8 rounded-lg text-lg inline-block"
      >
        返回儀表板
      </a>
    </div>
  );
};

export default NotFoundPage;
