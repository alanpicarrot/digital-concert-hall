import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setupAuthHeaders } from '../utils/authPersistUtils';

const DashboardPage = () => {
  const navigate = useNavigate();

  // 處理導航點擊
  const handleNavLinkClick = (path, e) => {
    e.preventDefault(); // 阻止默認行為
    
    // 使用 React Router 的 navigate 進行導航
    navigate(path);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">數位音樂廳後台管理</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">快速導航</h2>
          <div className="space-y-2">
            <a 
              href="/concerts" 
              onClick={(e) => handleNavLinkClick('/concerts', e)}
              className="block bg-teal-50 hover:bg-teal-100 p-3 rounded-md border-l-4 border-teal-500"
            >
              音樂會管理
            </a>
            <a 
              href="/performances" 
              onClick={(e) => handleNavLinkClick('/performances', e)}
              className="block bg-green-50 hover:bg-green-100 p-3 rounded-md border-l-4 border-green-500"
            >
              演出場次管理
            </a>
            <a 
              href="/ticket-types" 
              onClick={(e) => handleNavLinkClick('/ticket-types', e)}
              className="block bg-purple-50 hover:bg-purple-100 p-3 rounded-md border-l-4 border-purple-500"
            >
              票種管理
            </a>
            <a 
              href="/tickets" 
              onClick={(e) => handleNavLinkClick('/tickets', e)}
              className="block bg-orange-50 hover:bg-orange-100 p-3 rounded-md border-l-4 border-orange-500"
            >
              票券管理
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">操作指南</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>先創建音樂會基本信息</li>
            <li>為音樂會添加演出場次</li>
            <li>創建票種類型（如:VIP、標準票等）</li>
            <li>為演出場次創建對應票券</li>
            <li>上架後用戶即可購票</li>
          </ol>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">系統資訊</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">系統版本：</span> v1.0.0
            </p>
            <p>
              <span className="font-medium">數據庫：</span> H2 Database
            </p>
            <p>
              <span className="font-medium">後端：</span> Spring Boot 3.2.0
            </p>
            <p>
              <span className="font-medium">前端：</span> React + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;