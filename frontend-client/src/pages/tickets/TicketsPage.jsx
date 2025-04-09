import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Users, Search } from 'lucide-react';
import concertService from '../../services/concertService';
import SimplePlaceholder from '../../components/ui/SimplePlaceholder';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // 獲取所有音樂會
        const concertsData = await concertService.getAllConcerts();
        
        // 將每個音樂會的票券整理到一個數組中
        let allTickets = [];
        
        concertsData.forEach(concert => {
          if (concert.tickets && concert.tickets.length > 0) {
            concert.tickets.forEach(ticket => {
              allTickets.push({
                id: ticket.id,
                concertId: concert.id,
                concertTitle: concert.title,
                ticketType: ticket.ticketType.name,
                price: ticket.price,
                availableQuantity: ticket.availableQuantity,
                performance: ticket.performance,
                concertImage: concert.posterUrl
              });
            });
          }
        });
        
        setTickets(allTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return new Date(dateString).toLocaleDateString("zh-TW", options);
  };
  
  // 格式化時間
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString("zh-TW", options);
  };
  
  // 過濾票券
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      ticket.concertTitle.toLowerCase().includes(query) ||
      ticket.ticketType.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Ticket size={32} className="mr-2 text-indigo-600" />
          售票中的音樂會
        </h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋音樂會..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFilterActive(e.target.value !== '');
            }}
          />
          <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      
      {filterActive && (
        <div className="mb-4 bg-indigo-50 p-3 rounded-lg">
          <p className="text-indigo-700">
            正在搜尋: "{searchQuery}" - 找到 {filteredTickets.length} 個結果
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterActive(false);
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
              >
                清除搜尋
              </button>
            )}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <Ticket size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-500 mb-2">目前沒有可購買的票券</h2>
          <p className="text-gray-600 mb-6">請稍後再查看，或嘗試其他搜尋條件</p>
          <Link
            to="/concerts"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            瀏覽所有音樂會
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <div className="relative">
                {ticket.concertImage ? (
                  <img
                    src={ticket.concertImage}
                    alt={ticket.concertTitle}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <SimplePlaceholder
                    width="100%"
                    height={192}
                    text={ticket.concertTitle}
                    className="w-full h-48"
                  />
                )}
                <div className="absolute top-0 right-0 bg-indigo-600 text-white py-1 px-3 m-2 rounded-full">
                  NT$ {ticket.price}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{ticket.concertTitle}</h3>
                <p className="text-indigo-600 mb-3">{ticket.ticketType}</p>
                
                <div className="space-y-2 mb-4">
                  {ticket.performance && (
                    <>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(ticket.performance.startTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-4 h-4 mr-2"></div>
                        <span>{formatTime(ticket.performance.startTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span>{ticket.performance.venue || '數位音樂廳'}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>剩餘 {ticket.availableQuantity} 張</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/concerts/${ticket.concertId}`}
                    className="flex-1 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-center hover:bg-indigo-50 transition"
                  >
                    詳情
                  </Link>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition"
                  >
                    購票
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;