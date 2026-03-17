import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import { formatDate } from '../../utils/dateUtils';
import {
  Loader2, ArrowRight, AlertCircle, CheckCircle,
  Calendar, Clock, Ticket, Music,
  Filter, RefreshCw, MapPin, Hash
} from 'lucide-react';

// 票券狀態標籤元件
const TicketStatusBadge = ({ status }) => {
  if (status === 'VALID') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" />
        有效
      </span>
    );
  }
  if (status === 'USED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <CheckCircle size={12} className="mr-1" />
        已使用
      </span>
    );
  }
  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertCircle size={12} className="mr-1" />
        已過期
      </span>
    );
  }
  if (status === 'CANCELED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle size={12} className="mr-1" />
        已取消
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {status}
    </span>
  );
};

const UserTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getUserTickets(page, 10);
      const data = response.data.content || [];
      setTickets(data);
      setFilteredTickets(data);
      setTotalPages(response.data.totalPages);
      setActiveFilter('all');
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('載入票券時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const filterTickets = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredTickets(tickets);
    } else if (filter === 'valid') {
      setFilteredTickets(tickets.filter(t => !t.isUsed));
    } else if (filter === 'used') {
      setFilteredTickets(tickets.filter(t => t.isUsed));
    } else if (filter === 'expired') {
      setFilteredTickets(tickets.filter(t => t.status === 'EXPIRED'));
    }
  };

  const getTicketStatus = (ticket) => {
    if (ticket.status) return ticket.status;
    return ticket.isUsed ? 'USED' : 'VALID';
  };

  // 載入中
  if (loading && !refreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">載入票券中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* 頁面標題與刷新按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Ticket size={24} className="mr-2 text-indigo-600" />
          我的票券
        </h1>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center text-gray-600 hover:text-indigo-600 text-sm"
        >
          <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 錯誤狀態 */}
      {error && (
        <div className="p-6 bg-red-50 rounded-lg my-6 flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">發生錯誤</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 inline-flex items-center text-red-700 hover:text-red-900"
            >
              <RefreshCw size={14} className="mr-1" />
              重新載入
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 過濾選項 */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center overflow-x-auto">
            <Filter size={16} className="text-gray-500 mr-2 flex-shrink-0" />
            <div className="flex space-x-2">
              <button
                onClick={() => filterTickets('all')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => filterTickets('valid')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'valid'
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckCircle size={14} className="mr-1" />
                有效票券
              </button>
              <button
                onClick={() => filterTickets('used')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'used'
                    ? 'bg-gray-200 text-gray-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock size={14} className="mr-1" />
                已使用
              </button>
              <button
                onClick={() => filterTickets('expired')}
                className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                  activeFilter === 'expired'
                    ? 'bg-red-100 text-red-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertCircle size={14} className="mr-1" />
                已過期
              </button>
            </div>
          </div>

          {/* 票券列表 */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              {activeFilter !== 'all' ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Filter size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">
                    沒有{activeFilter === 'valid' ? '有效' : activeFilter === 'used' ? '已使用' : '已過期'}的票券
                  </h2>
                  <p className="text-gray-500 mb-6">嘗試查看其他狀態的票券或更改篩選條件</p>
                  <button
                    onClick={() => filterTickets('all')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    查看全部票券
                  </button>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Ticket size={24} className="text-gray-400" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">您尚未有任何票券</h2>
                  <p className="text-gray-500 mb-6">開始探索音樂廳的精彩演出，購買您喜愛的票券吧！</p>
                  <Link
                    to="/concerts"
                    className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Music size={16} className="mr-2" />
                    瀏覽演出
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* 票券標頭 */}
                  <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1.5">票號:</span>
                        <span className="font-medium text-gray-900">
                          {ticket.ticketCode || ticket.ticketNumber || '-'}
                        </span>
                        <div className="ml-3">
                          <TicketStatusBadge status={getTicketStatus(ticket)} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {ticket.performanceStartTime
                          ? formatDate(ticket.performanceStartTime)
                          : ticket.concert?.startTime
                            ? formatDate(ticket.concert.startTime)
                            : '未提供時間'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {ticket.ticketTypeName || ticket.ticketType?.name || '一般票'}
                      </div>
                    </div>
                  </div>

                  {/* 票券內容 */}
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {ticket.concertTitle || ticket.concert?.title || '未知演出'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {ticket.performanceVenue || ticket.concert?.venue || '未提供地點'}
                      </div>
                      {(ticket.seatNumber || ticket.seat) && (
                        <div className="flex items-center">
                          <Hash size={14} className="mr-1 text-gray-400" />
                          座位：{ticket.seatNumber || ticket.seat}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 票券操作 */}
                  <div className="px-6 py-3 flex justify-end">
                    <Link
                      to={`/user/tickets/${ticket.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      票券詳情 <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </>
      )}
    </div>
  );
};

export default UserTicketsPage;
