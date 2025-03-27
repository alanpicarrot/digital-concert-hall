import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import ticketService from '../../services/ticketService';

const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTicketDetail();
  }, [ticketId]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketDetail(ticketId);
      setTicket(response.data);
      setLoading(false);
    } catch (error) {
      setError('無法載入票券資料，請稍後再試。');
      setLoading(false);
      console.error('獲取票券詳情失敗:', error);
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
      <div className="mb-6">
        <Link to="/user/tickets" className="text-blue-600 hover:text-blue-800">
          &larr; 返回票券列表
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">票券詳情</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : ticket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{ticket.concertTitle}</h2>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  ticket.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                }`}>
                  {getStatusText(ticket.isUsed)}
                </span>
              </div>
              
              <div className="p-6">
                {ticket.posterUrl && (
                  <div className="mb-6">
                    <img 
                      src={ticket.posterUrl} 
                      alt={ticket.concertTitle} 
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider">表演場地</h3>
                    <p className="text-lg font-medium">{ticket.performanceVenue}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider">表演時間</h3>
                    <p className="text-lg font-medium">{formatDate(ticket.performanceStartTime)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider">票種</h3>
                    <p className="text-lg font-medium">{ticket.ticketTypeName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider">訂單編號</h3>
                    <p className="text-lg font-medium">{ticket.orderNumber}</p>
                  </div>
                </div>
                
                {ticket.concertDescription && (
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">音樂會描述</h3>
                    <div className="prose max-w-none">{ticket.concertDescription}</div>
                  </div>
                )}
                
                {ticket.programDetails && (
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">演出曲目</h3>
                    <div className="prose max-w-none">{ticket.programDetails}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">票券QR碼</h2>
              </div>
              
              <div className="p-6 flex flex-col items-center">
                {ticket.qrCodeBase64 ? (
                  <>
                    <div className="mb-4 p-3 bg-white rounded-lg shadow">
                      <img 
                        src={`data:image/png;base64,${ticket.qrCodeBase64}`} 
                        alt="Ticket QR Code" 
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center mb-2">請出示此QR碼進場</p>
                    <p className="text-xs font-medium text-gray-500 text-center">票券代碼: {ticket.ticketCode}</p>
                  </>
                ) : (
                  <div className="text-center text-gray-600">
                    無法生成QR碼
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button 
                  onClick={() => window.print()} 
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  列印票券
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl text-gray-600">找不到該票券</h2>
          <Link 
            to="/user/tickets" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            返回票券列表
          </Link>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
