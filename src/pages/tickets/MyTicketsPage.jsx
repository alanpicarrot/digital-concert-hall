import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ticketService from '../../services/ticketService';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchTickets();
  }, [currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getUserTickets(currentPage);
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      setError('無法載入票券資料，請稍後再試。');
      setLoading(false);
      console.error('獲取票券失敗:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm');
  };

  const getStatusText = (isUsed) => {
    return isUsed ? '已使用' : '未使用';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">我的票券</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">您尚未有任何票券</h2>
          <Link 
            to="/concerts" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            立即購票
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 truncate flex-1">{ticket.concertTitle}</h2>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ticket.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {getStatusText(ticket.isUsed)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">表演場地</div>
                    <div className="font-medium">{ticket.performanceVenue}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">表演時間</div>
                    <div className="font-medium">{formatDate(ticket.performanceStartTime)}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">票種</div>
                    <div className="font-medium">{ticket.ticketTypeName}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">訂單編號</div>
                    <div className="font-medium text-xs">{ticket.orderNumber}</div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Link 
                    to={`/user/tickets/${ticket.id}`} 
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    查看票券詳情
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分頁控制 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-md
                    ${currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  上一頁
                </button>
                <div className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                  第 {currentPage + 1} 頁，共 {totalPages} 頁
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-md
                    ${currentPage === totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  下一頁
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTicketsPage;
