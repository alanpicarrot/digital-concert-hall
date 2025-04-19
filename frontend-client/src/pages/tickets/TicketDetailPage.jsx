import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Ticket, Calendar, Clock, MapPin, Users, CreditCard, ShoppingCart } from 'lucide-react';
import concertService from '../../services/concertService';
import ticketService from '../../services/ticketService';
import authService from '../../services/authService';
import cartService from '../../services/cartService';
import SimplePlaceholder from '../../components/ui/SimplePlaceholder';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const expectedTicketType = searchParams.get('type');
  const [ticket, setTicket] = useState(null);
  const [concert, setConcert] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeMismatch, setTypeMismatch] = useState(false);
  
  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 如果有期望的票券類型，嘗試使用concertService.getTicketDetails
        let ticketData = null;
        let concertData = null;
        
        if (expectedTicketType) {
          try {
            console.log(`嘗試使用 concertService.getTicketDetails 獲取 ${expectedTicketType} 票券`);
            
            // 直接使用路由參數中的 id 獲取票券信息
            const details = await concertService.getTicketDetails(id, expectedTicketType);
            
            if (details) {
              console.log(`成功獲取票券詳情:`, details);
              
              ticketData = {
                id: details.id,
                ticketType: {
                  name: details.type,
                  description: details.description,
                  colorCode: details.colorCode
                },
                price: details.price,
                availableQuantity: details.availableQuantity,
                performance: details.performance
              };
              concertData = details.concert;
              
              // 票券類型驗證 - 使用更健壯的比較邏輯
              const normalizeString = (str) => {
                if (!str) return '';
                return str.toLowerCase().replace(/[\s-_]/g, '');
              };
              
              const normalizedRequestType = normalizeString(expectedTicketType);
              const normalizedResponseType = normalizeString(details.type);
              
              if (normalizedResponseType !== normalizedRequestType) {
                // 檢查是否包含關鍵字（如VIP或標準）
                const isVipRequest = normalizedRequestType.includes('vip');
                const isVipResponse = normalizedResponseType.includes('vip');
                const isStandardRequest = normalizedRequestType.includes('標準') || normalizedRequestType.includes('一般');
                const isStandardResponse = normalizedResponseType.includes('標準') || normalizedResponseType.includes('一般');
                
                // 只有當票券類型完全不匹配時才設置不匹配狀態
                if ((isVipRequest && !isVipResponse) || (isStandardRequest && !isStandardResponse)) {
                  console.warn('票券類型不匹配，期望:', expectedTicketType, '實際:', details.type);
                  setTypeMismatch(true);
                } else {
                  setTypeMismatch(false);
                }
              } else {
                setTypeMismatch(false);
              }
            } else {
              console.log(`未能通過 concertService.getTicketDetails 獲取票券詳情`);
            }
          } catch (detailsError) {
            console.error('使用getTicketDetails獲取票券時發生錯誤:', detailsError);
            
            // 檢查是否是授權問題（401錯誤）
            if (detailsError.response && detailsError.response.status === 401) {
              console.log('收到401錯誤，可能需要登入才能查看VIP票券');
              
              // 提示用戶登入以查看VIP票券詳情
              const shouldLogin = window.confirm('查看VIP票券需要登入。是否前往登入頁面？');
              if (shouldLogin) {
                navigate('/login?redirect=' + encodeURIComponent(`/tickets/${id}?type=${expectedTicketType}`));
                return; // 提前返回，避免繼續執行
              }
            }
            
            // 如果getTicketDetails失敗，將繼續嘗試使用原始方法
            console.log('將嘗試使用原始ticketService.getTicketById方法');
          }
        }
        
        // 如果未能使用getTicketDetails獲取數據，則使用原始方法
        if (!ticketData) {
          console.log(`使用ticketService.getTicketById(${id})獲取票券數據`);
          try {
            ticketData = await ticketService.getTicketById(id);
            
            // 如果URL中有期望的票券類型，進行驗證 - 使用更健壯的比較邏輯
            if (expectedTicketType && ticketData && ticketData.ticketType) {
              const normalizeString = (str) => {
                if (!str) return '';
                return str.toLowerCase().replace(/[\s-_]/g, '');
              };
              
              const normalizedRequestType = normalizeString(expectedTicketType);
              const normalizedResponseType = normalizeString(ticketData.ticketType.name);
              
              // 檢查票券類型是否匹配
              if (normalizedResponseType !== normalizedRequestType) {
                // 檢查是否包含關鍵字（如VIP或標準）
                const isVipRequest = normalizedRequestType.includes('vip');
                const isVipResponse = normalizedResponseType.includes('vip');
                const isStandardRequest = normalizedRequestType.includes('標準') || normalizedRequestType.includes('一般');
                const isStandardResponse = normalizedResponseType.includes('標準') || normalizedResponseType.includes('一般');
                
                // 只有當票券類型完全不匹配時才設置不匹配狀態
                if ((isVipRequest && !isVipResponse) || (isStandardRequest && !isStandardResponse)) {
                  console.warn('票券類型不匹配，期望:', expectedTicketType, '實際:', ticketData.ticketType.name);
                  setTypeMismatch(true);
                } else {
                  setTypeMismatch(false);
                }
              } else {
                setTypeMismatch(false);
              }
            } else {
              setTypeMismatch(false);
            }
          } catch (ticketError) {
            console.error('使用ticketService.getTicketById獲取票券時發生錯誤:', ticketError);
            // 如果是401錯誤，提示用戶登入
            if (ticketError.response && ticketError.response.status === 401) {
              const shouldLogin = window.confirm('查看票券需要登入。是否前往登入頁面？');
              if (shouldLogin) {
                navigate('/login?redirect=' + encodeURIComponent(`/tickets/${id}?type=${expectedTicketType}`));
                return; // 提前返回，避免繼續執行
              }
            }
            throw ticketError; // 重新拋出錯誤，讓外層catch處理
          }
        }
        
        setTicket(ticketData);
        
        // 如果使用getTicketDetails已獲取音樂會數據則直接使用
        if (concertData) {
          setConcert(concertData);
        } 
        // 否則從原始方法獲取音樂會詳情
        else if (ticketData && ticketData.performance && ticketData.performance.concertId) {
          console.log(`獲取音樂會資訊: concertId=${ticketData.performance.concertId}`);
          try {
            concertData = await concertService.getConcertById(ticketData.performance.concertId);
            setConcert(concertData);
          } catch (concertError) {
            console.error('獲取音樂會詳情時發生錯誤:', concertError);
            throw new Error('無法獲取相關音樂會資訊');
          }
        } else {
          throw new Error('無法獲取票券相關的音樂會資訊');
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        setError('無法獲取票券資訊，請稍後再試');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketDetail();
  }, [id, expectedTicketType, navigate]);
  
  // 處理數量變更
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (ticket?.availableQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };
  
  // 計算總價
  const calculateTotal = () => {
    if (!ticket) return 0;
    return ticket.price * quantity;
  };
  
  // 處理加入購物車
  const handleAddToCart = () => {
    if (!ticket) return;

    // 檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    
    console.log('購物車 - 用戶登入狀態:', {
      user: currentUser ? currentUser.username : '未登入', 
      tokenValid: isTokenValid ? '有效' : '無效或過期'
    });

    // 檢查用戶是否已登入
    if (!currentUser || !isTokenValid) {
      // 如果未登入，導向登入頁面
      alert('請先登入才能將商品加入購物車');
      
      // 先清除已失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();
      }
      
      navigate('/login?redirect=' + encodeURIComponent(`/tickets/${id}`));
      return;
    }

    // 創建購物車項目
    const cartItem = {
      id: ticket.id,
      type: 'ticket',
      name: `${concert.title} - ${ticket.ticketType.name}`,
      price: ticket.price,
      quantity: quantity,
      date: ticket.performance.startTime,
      concertId: concert.id
    };
    
    // 添加到購物車
    cartService.addToCart(cartItem);

    // 成功提示
    alert(`已將 ${quantity} 張 ${ticket.ticketType.name} 加入購物車，總金額：NT$ ${calculateTotal()}`);
  };

  // 處理立即購買
  const handleBuyNow = () => {
    if (!ticket) {
      console.error('無法購買: 票券信息缺失');
      alert('票券信息無效，請重新選擇票券');
      return;
    }

    // 檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    
    console.log('票券頁面 - 用戶登入狀態:', {
      user: currentUser ? currentUser.username : '未登入',
      tokenValid: isTokenValid ? '有效' : '無效或過期',
      ticketId: ticket.id,
      concertId: concert?.id
    });

    // 檢查用戶是否已登入
    if (!currentUser || !isTokenValid) {
      // 如果未登入，導向登入頁面
      alert('請先登入才能進行購票');
      
      // 先清除已失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();
      }
      
      navigate('/login?redirect=' + encodeURIComponent(`/tickets/${id}`));
      return;
    }

    try {
      // 將購票信息存入 sessionStorage
      const ticketInfo = {
        concertId: concert.id,
        concertTitle: concert.title,
        ticketId: ticket.id,
        ticketType: ticket.ticketType.name,
        ticketPrice: ticket.price,
        quantity: quantity,
        totalAmount: calculateTotal(),
        purchaseTime: new Date().toISOString(),
        // 添加演出相關資訊
        performanceTime: ticket.performance?.startTime,
        venue: ticket.performance?.venue
      };

      sessionStorage.setItem("checkoutInfo", JSON.stringify(ticketInfo));
      console.log('已將購票信息存入sessionStorage:', ticketInfo);
      console.log('準備導向到結帳頁面: /checkout');

      // 導航到結帳頁面
      navigate("/checkout", { 
        state: { 
          from: `/tickets/${id}`, 
          direct: true,
          authenticated: true
        }
      });
    } catch (error) {
      console.error('處理立即購買時發生錯誤:', error);
      alert('處理購票資訊時發生錯誤，請重試');
    }
  };

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
  
  // 計算演出時長（分鐘）
  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    return Math.floor(durationMs / (1000 * 60)) + ' 分鐘';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">發生錯誤</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/tickets" className="inline-flex items-center text-red-700 hover:text-red-900">
            <ChevronLeft size={20} />
            <span>返回票券列表</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket || !concert) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">找不到票券</h1>
        <p className="text-gray-600 mb-8">您要查詢的票券不存在或已售完。</p>
        <Link to="/tickets" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={20} />
          <span>返回票券列表</span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <div className="text-sm text-gray-500 mb-6">
        <div className="flex items-center space-x-2">
          <Link to="/" className="hover:text-indigo-600">首頁</Link>
          <span>/</span>
          <Link to="/concerts" className="hover:text-indigo-600">音樂會</Link>
          <span>/</span>
          <Link to={`/concerts/${concert.id}`} className="hover:text-indigo-600">{concert.title}</Link>
          <span>/</span>
          <span className="text-gray-700">購票</span>
        </div>
      </div>
      
      {/* 票券詳情卡片 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* 左側音樂會圖片 */}
          <div className="md:w-1/3">
            {concert.posterUrl ? (
              <img
                src={concert.posterUrl}
                alt={concert.title}
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <SimplePlaceholder
                width="100%"
                height="100%"
                text={concert.title}
                className="w-full h-64 md:h-full object-cover"
              />
            )}
          </div>
          
          {/* 右側票券信息 */}
          <div className="md:w-2/3 p-6">
            {typeMismatch && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>注意：</strong> 您正在查看的票券類型與您的選擇不符。這可能是因為URL参數發生了變更。
                    </p>
                    <p className="mt-1 text-xs text-yellow-600">
                      您期望查看的是 <strong>{expectedTicketType}</strong>，但當前顯示的是 <strong>{ticket.ticketType.name}</strong>。
                    </p>
                    <Link to={`/tickets/performance/${ticket.performance.id}`} className="mt-2 inline-block text-xs text-indigo-600 hover:text-indigo-800">
                      返回票券選擇頁面
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{concert.title}</h1>
                <p className="text-indigo-600 text-xl mb-4">{ticket.ticketType.name}</p>
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-bold">
                NT$ {ticket.price}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Calendar size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出日期</p>
                  <p>{formatDate(ticket.performance.startTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出時間</p>
                  <p>{formatTime(ticket.performance.startTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出場地</p>
                  <p>{ticket.performance.venue || '數位音樂廳'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出時長</p>
                  <p>{getDuration(ticket.performance.startTime, ticket.performance.endTime)}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users size={20} className="mr-2 text-gray-500" />
                  <span className="font-medium">購票數量</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-full"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-full"
                    disabled={quantity >= ticket.availableQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="text-gray-600 mb-2">
                <span>可購票數: {ticket.availableQuantity} 張</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium">總計金額</span>
                <span className="text-xl font-bold text-indigo-600">
                  NT$ {calculateTotal()}
                </span>
              </div>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  加入購物車
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  <CreditCard size={20} className="mr-2" />
                  立即購買
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 音樂會詳情區塊 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-bold">音樂會詳情</h2>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            {concert.description ? (
              <p className="whitespace-pre-line">{concert.description}</p>
            ) : (
              <p className="text-gray-500">暫無詳細介紹</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 票券使用說明 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-bold">購票須知</h2>
        </div>
        <div className="p-6">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>購票成功後，您將收到電子票券，請在演出當天出示</li>
            <li>一張票券限一人使用，請妥善保管您的票券</li>
            <li>演出開始前30分鐘開放入場</li>
            <li>為避免影響他人觀賞體驗，演出開始後遲到觀眾將安排在適當時間入場</li>
            <li>禁止攝影、錄影及錄音，請將手機關靜音</li>
            <li>如需退票，請至少在演出前7天申請，將收取票價10%手續費</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;