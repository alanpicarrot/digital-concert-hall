import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import { formatDate } from '../../utils/dateUtils';

const UserTicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTicketDetail = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTicketDetail(ticketId);
        setTicket(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load ticket details:', err);
        setError('載入票券詳情時發生錯誤，請稍後再試。');
        setLoading(false);
      }
    };

    loadTicketDetail();
  }, [ticketId]);

  const getStatusDetails = (status) => {
    switch (status) {
      case 'VALID':
        return {
          label: '有效',
          color: 'green',
          description: '此票券有效，可於演出當日使用'
        };
      case 'USED':
        return {
          label: '已使用',
          color: 'gray',
          description: '此票券已經使用'
        };
      case 'EXPIRED':
        return {
          label: '已過期',
          color: 'red',
          description: '此票券已經過期'
        };
      case 'CANCELED':
        return {
          label: '已取消',
          color: 'yellow',
          description: '此票券已被取消'
        };
      default:
        return {
          label: status,
          color: 'blue',
          description: '票券狀態'
        };
    }
  };

  // 如果正在載入
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">載入票券詳情中...</p>
      </div>
    );
  }

  // 如果出錯
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-2xl mb-4">😢</div>
        <p className="text-red-500">{error}</p>
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/user/tickets')} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            返回票券列表
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  // 如果沒有票券數據
  if (!ticket) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">未找到票券</h2>
        <p className="text-gray-500 mb-6">找不到ID為 {ticketId} 的票券資訊</p>
        <p className="text-gray-500 mb-2">這可能是因為：</p>
        <ul className="text-gray-500 mb-6 list-disc list-inside">
          <li>票券ID不正確</li>
          <li>票券已被刪除</li>
          <li>後端功能尚未完全實現（目前為開發階段）</li>
        </ul>
        <Link 
          to="/user/tickets" 
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          返回票券列表
        </Link>
      </div>
    );
  }

  const statusDetails = getStatusDetails(ticket.status);
  
  return (
    <div>
      {/* 返回按鈕 */}
      <div className="mb-6">
        <Link 
          to="/user/tickets" 
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回票券列表
        </Link>
      </div>

      {/* 票券狀態橫幅 */}
      <div className={`bg-${statusDetails.color}-100 border border-${statusDetails.color}-200 rounded-md p-4 mb-6`}>
        <div className="flex items-center">
          <div className={`bg-${statusDetails.color}-500 rounded-full h-3 w-3 mr-2`}></div>
          <span className={`font-medium text-${statusDetails.color}-800`}>{statusDetails.label}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className={`text-${statusDetails.color}-700`}>{statusDetails.description}</span>
        </div>
      </div>

      {/* 票券主要資訊 */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        {/* 演出資訊 */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{ticket.concert?.title || '未知演出'}</h1>
          <div className="flex flex-wrap text-sm text-gray-600">
            <div className="mr-6 mb-2">
              <span className="font-medium">日期時間：</span>
              {ticket.concert?.startTime ? formatDate(ticket.concert.startTime) : '未提供時間'}
            </div>
            <div>
              <span className="font-medium">地點：</span>
              {ticket.concert?.venue || '未提供地點'}
            </div>
          </div>
        </div>
        
        {/* 票券資訊 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500">票券類型</h3>
              <p className="mt-1 text-lg text-gray-800">{ticket.ticketType?.name || '一般票'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">票券價格</h3>
              <p className="mt-1 text-lg text-gray-800">NT$ {ticket.ticketType?.price || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">座位資訊</h3>
              <p className="mt-1 text-lg text-gray-800">{ticket.seat || '無座位資訊'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">票券編號</h3>
              <p className="mt-1 text-lg text-gray-800">{ticket.ticketNumber}</p>
            </div>
            {ticket.orderNumber && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">訂單編號</h3>
                <p className="mt-1 text-lg text-gray-800">{ticket.orderNumber}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">購買時間</h3>
              <p className="mt-1 text-lg text-gray-800">{ticket.createdAt ? formatDate(ticket.createdAt) : '-'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR碼進場區塊 */}
      {ticket.status === 'VALID' && ticket.qrCode && (
        <div className="bg-white border rounded-lg overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">票券QR碼</h2>
          <p className="text-gray-500 mb-4">演出入場時請出示此QR碼供工作人員掃描</p>
          <div className="bg-white inline-block p-4 border-4 border-indigo-100 rounded-lg mb-4">
            <img src={`data:image/png;base64,${ticket.qrCode}`} alt="入場QR碼" className="w-64 h-64 mx-auto" />
          </div>
          <p className="text-gray-400 text-sm">QR碼僅能使用一次，請妥善保管</p>
        </div>
      )}

      {/* 取消的票券 */}
      {ticket.status === 'CANCELED' && (
        <div className="bg-white border rounded-lg overflow-hidden p-6 text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">此票券已被取消</h2>
          <p className="text-gray-500">此票券已不再有效，無法用於入場</p>
        </div>
      )}

      {/* 已使用的票券 */}
      {ticket.status === 'USED' && (
        <div className="bg-white border rounded-lg overflow-hidden p-6 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">此票券已使用</h2>
          <p className="text-gray-500 mb-2">您已於 {ticket.usedAt ? formatDate(ticket.usedAt) : '未知時間'} 使用此票券入場</p>
          <p className="text-gray-400 text-sm">感謝您參與此次演出</p>
        </div>
      )}

      {/* 已過期的票券 */}
      {ticket.status === 'EXPIRED' && (
        <div className="bg-white border rounded-lg overflow-hidden p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⏱</div>
          <h2 className="text-xl font-semibold mb-2">此票券已過期</h2>
          <p className="text-gray-500">此票券已過期，無法用於入場</p>
        </div>
      )}
    </div>
  );
};

export default UserTicketDetailPage;
