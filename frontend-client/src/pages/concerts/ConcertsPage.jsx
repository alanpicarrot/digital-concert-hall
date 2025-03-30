import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Music, Filter } from 'lucide-react';
import concertService from '../../services/concertService';
import SimplePlaceholder from '../../components/ui/SimplePlaceholder';

const ConcertsPage = () => {
  // 模擬音樂會數據
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timeframe: 'all',
    artist: '',
    genre: ''
  });

  // 從後端加載真實數據
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        // 根據過濾條件獲取不同類型的音樂會
        let concertsData;
        
        if (filters.timeframe === 'past') {
          concertsData = await concertService.getPastConcerts();
        } else if (filters.timeframe === 'upcoming') {
          concertsData = await concertService.getUpcomingConcerts();
        } else {
          concertsData = await concertService.getAllConcerts();
        }
        
        // 將API返回的數據轉換為前端需要的格式
        const formattedConcerts = concertsData.map(concert => ({
          id: concert.id,
          title: concert.title,
          performer: '表演者', // 因為目前後端沒有提供表演者信息，可以先設置為固定值
          date: concert.startTime || new Date().toISOString(),
          posterUrl: concert.posterUrl,
          location: concert.venue || '數位音樂廳主廳',
          genre: '古典音樂', // 目前後端沒有提供音樂類型信息
          price: { min: 300, max: 1200 }, // 目前後端沒有提供價格區間信息
          description: concert.description
        }));
        
        setConcerts(formattedConcerts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching concerts:', error);
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [filters.timeframe]);

  // 根據過濾條件篩選音樂會
  const filteredConcerts = concerts.filter(concert => {
    // 時間過濾
    if (filters.timeframe === 'upcoming' && new Date(concert.date) < new Date()) {
      return false;
    }
    if (filters.timeframe === 'past' && new Date(concert.date) >= new Date()) {
      return false;
    }
    
    // 藝術家過濾
    if (filters.artist && !concert.performer.toLowerCase().includes(filters.artist.toLowerCase())) {
      return false;
    }
    
    // 類型過濾
    if (filters.genre && concert.genre !== filters.genre) {
      return false;
    }
    
    return true;
  });

  // 處理過濾條件變更
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // 日期格式化
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">音樂會列表</h1>
      
      {/* 過濾器 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter size={18} className="mr-2 text-indigo-600" />
            <span className="font-medium text-gray-700">過濾條件:</span>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="timeframe" className="mr-2 text-gray-600">時間:</label>
            <select
              id="timeframe"
              className="p-2 border border-gray-300 rounded-md text-sm"
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
            >
              <option value="all">所有時間</option>
              <option value="upcoming">即將上演</option>
              <option value="past">過去演出</option>
            </select>
          </div>
          
          <div className="flex-grow">
            <input
              type="text"
              placeholder="搜尋藝術家..."
              className="p-2 border border-gray-300 rounded-md text-sm w-full"
              value={filters.artist}
              onChange={(e) => handleFilterChange('artist', e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="p-2 border border-gray-300 rounded-md text-sm"
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              <option value="">所有類型</option>
              <option value="古典音樂">古典音樂</option>
              <option value="爵士樂">爵士樂</option>
              <option value="交響樂">交響樂</option>
              <option value="世界音樂">世界音樂</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 音樂會列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcerts.length > 0 ? (
            filteredConcerts.map((concert) => (
              <div key={concert.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  {concert.posterUrl ? (
                    <img src={concert.posterUrl} alt={concert.title} className="w-full h-full object-cover" />
                  ) : (
                    <SimplePlaceholder 
                      width="100%" 
                      height="100%" 
                      text={concert.title}
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{concert.title}</h2>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <User size={16} className="mr-1 text-indigo-600" />
                    <span>{concert.performer}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-1 text-indigo-600" />
                    <span>{formatDate(concert.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Music size={16} className="mr-1 text-indigo-600" />
                    <span>{concert.genre}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-800">
                      <span className="font-semibold">NT${concert.price.min} - {concert.price.max}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/concerts/${concert.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        查看詳情
                      </Link>
                      <Link
                        to={`/tickets/${concert.id}`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-medium"
                      >
                        購票
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <div className="text-gray-500 text-lg">沒有找到符合條件的音樂會</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConcertsPage;