import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import { formatDate } from '../../utils/dateUtils';

// 票券狀態標籤元件
const TicketStatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800';
      case 'USED':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
      {status === 'VALID' && '有效'}
      {status === 'USED' && '已使用'}
      {status === 'EXPIRED' && '已過期'}
      {status === 'CANCELED' && '已取消'}
      {!['VALID', 'USED', 'EXPIRED', 'CANCELED'].includes(status) && status}
    </span>
  );
};

const UserTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getUserTickets(page, 10);
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('載入票券時發生錯誤，請稍後再試。');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const filterTickets = (filter) => {
    setActiveFilter(filter);
    // 在實際應用中，這裡可能需要發起新的API請求以應用過濾條件
    // 但由於後端可能沒有這樣的過濾功能，所以只是修改前端狀態
  };

  // 如果正在載入
  if (loading && tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">載入您的票券中...</p>
      </div>
    );
  }

  // 如果出錯
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-2xl mb-4">😢</div>
        <p className="text-red-500 mb-2">{error}</p>
        <p className="text-gray-500 mb-2">這可能是因為：</p>
        <ul className="text-gray-500 mb-6 list-disc list-inside text-left max-w-md mx-auto">
          <li>網路連線無法建立</li>
          <li>登入狀態已過期</li>
          <li>後端服務暫時無法提供資料</li>
          <li>API路徑格式不一致（請檢查API路徑前綴是否正確）</li>
        </ul>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={loadTickets} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重試
          </button>
          <Link 
            to="/" 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  // 如果沒有票券
  if (tickets.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎟️</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">您尚未有票券</h2>
        <p className="text-gray-500 mb-6">在演出購買時即可獲得電子票券</p>
        <Link 
          to="/concerts" 
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          瀏覽演出
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的票券</h1>

      {/* 過濾選項 */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => filterTickets('all')}
          className={`px-4 py-2 ${activeFilter === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
        >
          全部
        </button>
        <button
          onClick={() => filterTickets('valid')}
          className={`px-4 py-2 ${activeFilter === 'valid' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
        >
          有效票券
        </button>
        <button
          onClick={() => filterTickets('used')}
          className={`px-4 py-2 ${activeFilter === 'used' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
        >
          已使用
        </button>
        <button
          onClick={() => filterTickets('expired')}
          className={`px-4 py-2 ${activeFilter === 'expired' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
        >
          已過期
        </button>
      </div>

      {/* 票券列表 */}
      <div className="space-y-4">
        {tickets.map(ticket => (
          <Link
            key={ticket.id}
            to={`/user/tickets/${ticket.id}`}
            className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {/* 左側演出圖片 */}
              <div className="md:w-1/4 h-40 bg-gray-200">
                {ticket.concert?.posterUrl ? (
                  <img 
                    src={ticket.concert.posterUrl} 
                    alt={ticket.concert.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span>無演出圖片</span>
                  </div>
                )}
              </div>

              {/* 右側票券資訊 */}
              <div className="p-4 md:w-3/4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{ticket.concertTitle || ticket.concert?.title || '未知演出'}</h3>
                  <TicketStatusBadge status={ticket.isUsed ? 'USED' : 'VALID'} />
                </div>
                <p className="text-gray-600 mt-1">{ticket.ticketTypeName || ticket.ticketType?.name || '一般票'}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">演出時間：</span>
                    {ticket.performanceStartTime ? formatDate(ticket.performanceStartTime) : 
                     ticket.concert?.startTime ? formatDate(ticket.concert.startTime) : '未提供時間'}
                  </p>
                  <p>
                    <span className="font-medium">演出地點：</span>
                    {ticket.performanceVenue || ticket.concert?.venue || '未提供地點'}
                  </p>
                  <p>
                    <span className="font-medium">票號：</span>
                    {ticket.ticketCode || ticket.ticketNumber || '-'}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-indigo-600 text-sm font-medium">查看詳情 →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className={`px-3 py-1 rounded ${page === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
            >
              上一頁
            </button>
            {[...Array(totalPages).keys()].map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded ${pageNum === page ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-50'}`}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className={`px-3 py-1 rounded ${page === totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
            >
              下一頁
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default UserTicketsPage;