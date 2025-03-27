import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Music, ShoppingCart, ChevronRight, Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import cartService from '../../services/cartService';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        // 模擬從API獲取事件數據
        // 在生產環境中，您應該使用真實的API調用
        setTimeout(() => {
          const mockEvent = {
            id: eventId,
            name: '莫札特鋼琴協奏曲之夜',
            description: '由國際知名鋼琴家演繹莫札特最經典的鋼琴協奏曲，與管弦樂團共同呈現音樂盛宴。',
            longDescription: `
              <p>莫札特的鋼琴協奏曲被認為是古典音樂中最偉大的作品之一。這場音樂會將呈現他最受歡迎的協奏曲，包括第20號、第21號和第23號。</p>
              <p>這些作品被選擇是因為它們展示了莫札特超凡的作曲技巧，以及他對於情感表達的獨特能力。第20號協奏曲充滿戲劇性和熱情，第21號以其優美的慢板樂章而聞名，而第23號則展現了莫札特晚期風格的精髓。</p>
              <p>國際知名鋼琴家將與管弦樂團合作，為您帶來一個難忘的音樂之夜。</p>
            `,
            date: '2025-04-15T19:30:00',
            duration: 120, // 分鐘
            venue: '國家音樂廳',
            venueAddress: '台北市中山南路21-1號',
            imageUrl: 'https://via.placeholder.com/1200x600?text=Mozart+Piano+Concert',
            performers: [
              { name: '王大明', role: '鋼琴家' },
              { name: '國家交響樂團', role: '管弦樂團' },
              { name: '張小明', role: '指揮' },
            ],
            program: [
              { title: '鋼琴協奏曲第20號 D小調，K.466', composer: '莫札特', duration: '30分鐘' },
              { title: '鋼琴協奏曲第21號 C大調，K.467', composer: '莫札特', duration: '28分鐘' },
              { title: '中場休息', composer: '', duration: '20分鐘' },
              { title: '鋼琴協奏曲第23號 A大調，K.488', composer: '莫札特', duration: '26分鐘' },
            ],
            ticketTypes: [
              { id: 1, name: 'VIP席', price: 1500, description: '最佳視聽位置，含精美節目冊', availableQuantity: 50 },
              { id: 2, name: '一般席', price: 1000, description: '良好的視聽體驗', availableQuantity: 100 },
              { id: 3, name: '經濟席', price: 600, description: '實惠選擇', availableQuantity: 150 },
              { id: 4, name: '數位體驗', price: 300, description: '線上觀看直播及30天回放', availableQuantity: 999 },
            ],
          };
          
          setEvent(mockEvent);
          
          // 初始化票券選擇狀態
          const initialSelection = {};
          mockEvent.ticketTypes.forEach(ticket => {
            initialSelection[ticket.id] = 0;
          });
          
          setSelectedTickets(initialSelection);
          setLoading(false);
        }, 800);
        
      } catch (err) {
        console.error('Error fetching event details', err);
        setError('無法載入活動詳情，請稍後再試。');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const updateTicketQuantity = (ticketId, increment) => {
    setSelectedTickets(prev => {
      const currentQuantity = prev[ticketId] || 0;
      const newQuantity = increment 
        ? Math.min(currentQuantity + 1, 10) // 最多選10張票
        : Math.max(currentQuantity - 1, 0);  // 最少0張
      
      return {
        ...prev,
        [ticketId]: newQuantity
      };
    });
    
    // 重置加入購物車的提示
    setAddedToCart(false);
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!event) return 0;
    
    return event.ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * (selectedTickets[ticket.id] || 0));
    }, 0);
  };

  const handleAddToCart = () => {
    if (getTotalSelectedTickets() === 0) {
      return;
    }
    
    // 將選中的票券添加到購物車
    event.ticketTypes.forEach(ticketType => {
      const quantity = selectedTickets[ticketType.id];
      if (quantity > 0) {
        cartService.addToCart({
          id: ticketType.id.toString(),
          type: 'concert',
          name: `${event.name} - ${ticketType.name}`,
          price: ticketType.price,
          quantity: quantity,
          image: event.imageUrl,
          date: event.date
        });
      }
    });
    
    // 顯示添加成功提示
    setAddedToCart(true);
    
    // 重置選擇
    const resetSelection = {};
    event.ticketTypes.forEach(ticket => {
      resetSelection[ticket.id] = 0;
    });
    setSelectedTickets(resetSelection);
  };

  const handleCheckout = () => {
    // 直接添加到購物車，然後跳轉到結帳頁面
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertTriangle className="flex-shrink-0 text-red-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">發生錯誤</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700">找不到活動</h2>
          <p className="mt-2 text-gray-600">無法找到ID為 {eventId} 的活動</p>
          <Link 
            to="/events" 
            className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
          >
            瀏覽所有活動
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-indigo-600">首頁</Link>
        <ChevronRight size={16} className="mx-1" />
        <Link to="/events" className="hover:text-indigo-600">音樂會</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="text-gray-700">{event.name}</span>
      </div>
      
      {/* 活動頭部 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 md:h-96 bg-gray-100">
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6">
            <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <Calendar className="flex-shrink-0 mr-2 text-indigo-600" size={20} />
              <span>{new Date(event.date).toLocaleDateString('zh-TW', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="flex-shrink-0 mr-2 text-indigo-600" size={20} />
              <span>{new Date(event.date).toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit'
              })} | {event.duration} 分鐘</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="flex-shrink-0 mr-2 text-indigo-600" size={20} />
              <span>{event.venue}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{event.description}</p>
          
          <div className="flex flex-wrap md:flex-nowrap gap-8">
            {/* 左側內容 */}
            <div className="w-full md:w-2/3">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Music className="mr-2 text-indigo-600" />
                  節目資訊
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {event.program.map((item, index) => (
                    <div 
                      key={index}
                      className={`py-3 ${index !== event.program.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="font-medium">{item.title}</div>
                      {item.composer && (
                        <div className="text-sm text-gray-600">作曲: {item.composer}</div>
                      )}
                      {item.duration && (
                        <div className="text-sm text-gray-500">時長: {item.duration}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">演出者</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.performers.map((performer, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium">{performer.name}</div>
                      <div className="text-sm text-gray-600">{performer.role}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">詳細介紹</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.longDescription }}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">場地資訊</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-2">{event.venue}</div>
                  <div className="text-gray-600 mb-4">{event.venueAddress}</div>
                  {/* 這裡可以添加地圖 */}
                </div>
              </div>
            </div>
            
            {/* 右側票券資訊 */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-6">
                <h2 className="text-xl font-bold mb-4">選擇票券</h2>
                
                <div className="space-y-4 mb-6">
                  {event.ticketTypes.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-gray-600">{ticket.description}</div>
                        </div>
                        <div className="text-lg font-bold text-indigo-600">NT$ {ticket.price}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          尚餘 {ticket.availableQuantity} 張
                        </div>
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateTicketQuantity(ticket.id, false)}
                            className={`p-1 rounded-full ${selectedTickets[ticket.id] > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                            disabled={selectedTickets[ticket.id] <= 0}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                          <button 
                            onClick={() => updateTicketQuantity(ticket.id, true)}
                            className="p-1 rounded-full bg-indigo-100 text-indigo-600"
                            disabled={selectedTickets[ticket.id] >= 10 || selectedTickets[ticket.id] >= ticket.availableQuantity}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {addedToCart && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
                    <CheckCircle className="flex-shrink-0 mr-2" size={16} />
                    已成功加入購物車
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>已選票券:</span>
                    <span>{getTotalSelectedTickets()} 張</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>總計金額:</span>
                    <span>NT$ {getTotalPrice()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={getTotalSelectedTickets() === 0}
                    className={`flex items-center justify-center ${getTotalSelectedTickets() === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-2 px-4 rounded-lg`}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    加入購物車
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={getTotalSelectedTickets() === 0}
                    className={`${getTotalSelectedTickets() === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'} py-2 px-4 rounded-lg`}
                  >
                    立即購買
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
