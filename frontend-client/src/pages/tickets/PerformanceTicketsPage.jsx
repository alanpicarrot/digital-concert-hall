import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import concertService from '../../services/concertService';
import ticketService from '../../services/ticketService';
import SimplePlaceholder from '../../components/ui/SimplePlaceholder';

const PerformanceTicketsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [concert, setConcert] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 獲取演出場次詳情
        let performanceData;
        try {
          console.log(`嘗試獲取演出場次ID: ${id}`);
          performanceData = await ticketService.getPerformanceById(id);
          console.log('成功獲取演出場次數據:', performanceData);
          setPerformance(performanceData);
        } catch (performanceError) {
          console.error('獲取演出場次數據失敗:', performanceError);
          // 將錯誤向上拋出，讓外層 catch 處理
          throw new Error(`獲取演出場次數據失敗: ${performanceError.message}`);
        }
        
        // 獲取相關聯的音樂會詳情
        if (performanceData && performanceData.concertId) {
          try {
            console.log(`嘗試獲取音樂會ID: ${performanceData.concertId}`);
            const concertData = await concertService.getConcertById(performanceData.concertId);
            console.log('成功獲取音樂會數據:', concertData);
            setConcert(concertData);
          } catch (concertError) {
            console.error('獲取音樂會數據失敗:', concertError);
            // 不再使用模擬數據，而是拋出錯誤或設置錯誤狀態
             setError(`無法獲取關聯的音樂會資訊(ID: ${performanceData.concertId})`);
             // 可以選擇在這裡 return 或繼續嘗試獲取票券
             // throw new Error(`獲取音樂會數據失敗: ${concertError.message}`);
          }
        } else {
           // 如果沒有 concertId，也應該處理
           console.warn('演出場次數據中缺少 concertId');
           setError('無法從演出場次資訊中獲取關聯的音樂會ID');
        }
        
        // 獲取該演出場次的所有可用票券
        // 只有在成功獲取 performanceData 後才嘗試獲取票券
        if (performanceData) {
          try {
            console.log(`嘗試獲取演出場次ID ${id} 的票券`);
            const ticketsData = await ticketService.getTicketsByPerformance(id);
            console.log('成功獲取票券數據:', ticketsData);
          
            if (Array.isArray(ticketsData) && ticketsData.length > 0) {
              const enhancedTickets = ticketsData.map(ticket => ({
                ...ticket,
                // 確保 performance 對象包含必要的演出信息
                performance: {
                  ...ticket.performance, // 保留票券原有的 performance 信息
                  id: performanceData.id, // 確保 ID 正確
                  startTime: performanceData.startTime,
                  endTime: performanceData.endTime,
                  venue: performanceData.venue,
                  concertId: performanceData.concertId
                }
              }));
              setTickets(enhancedTickets);
            } else {
              // 如果 API 返回空數組或非數組，設置為空數組
              setTickets([]);
              console.log(`演出場次 ${id} 沒有可用的票券`);
            }
          } catch (ticketsError) {
            console.error('獲取票券數據失敗:', ticketsError);
            // 不再使用模擬數據，而是設置錯誤狀態
            setError(`無法獲取演出場次 ${id} 的票券資訊`);
            setTickets([]); // 清空票券
          }
        } else {
           // 如果 performanceData 獲取失敗，就不需要獲取票券了
           setTickets([]);
        }

      } catch (error) {
        console.error('獲取演出頁面數據時發生錯誤:', error);
        // 統一處理頂層錯誤
        setError(error.message || '無法載入演出資訊，請稍後再試');
        // 清空可能已部分設置的狀態
        setPerformance(null);
        setConcert(null);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [id]);
  
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
          <Link to="/concerts" className="inline-flex items-center text-red-700 hover:text-red-900">
            <ChevronLeft size={20} />
            <span>返回音樂會列表</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!performance || !concert) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">找不到演出場次</h1>
        <p className="text-gray-600 mb-8">您要查詢的演出場次不存在或已結束。</p>
        <Link to="/concerts" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft size={20} />
          <span>返回音樂會列表</span>
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
      
      {/* 演出場次信息 */}
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
          
          {/* 右側演出場次信息 */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{concert.title}</h1>
            <p className="text-gray-600 mb-6">請選擇您要購買的票種</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <Calendar size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出日期</p>
                  <p>{formatDate(performance.startTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出時間</p>
                  <p>{formatTime(performance.startTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出場地</p>
                  <p>{performance.venue || '數位音樂廳'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">演出時長</p>
                  <p>{getDuration(performance.startTime, performance.endTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 票券選擇區塊 */}
      <h2 className="text-xl font-bold mb-4">可選票券</h2>
      
      {tickets.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-2">
            <Ticket size={24} className="text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-700">暫無可購買票券</h3>
          </div>
          <p className="text-yellow-600 mb-4">目前沒有該場次的可購買票券，請稍後再查看或選擇其他場次。</p>
          <Link
            to={`/concerts/${concert.id}`}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" />
            返回音樂會詳情
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            // 處理新的API返回格式
            const ticketName = ticket.ticketType?.name || ticket.name;
            const ticketDescription = ticket.ticketType?.description || ticket.description || '標準票種，良好的視聽體驗';
            const ticketPrice = ticket.price;
            const availableQuantity = ticket.availableQuantity;
            
            // Ensure performance object and its id are available
            const currentPerformanceId = performance?.id; 
            if (!currentPerformanceId) {
              console.error("Performance ID is missing for ticket:", ticket.id);
              // Optionally render differently or skip this ticket
              return null; 
            }
            
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">{ticketName}</h3>
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                      NT$ {ticketPrice}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 h-12">
                    {ticketDescription}
                  </p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    剩餘數量: <span className="font-medium">{availableQuantity} 張</span>
                  </div>
                  
                  <Link
                    // Update the URL format here
                    to={`/tickets/${currentPerformanceId}/${ticket.id}?type=${encodeURIComponent(ticketName)}`}
                    className="block w-full py-2 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition"
                  >
                    選擇此票種
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 音樂會詳情區塊 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
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
      
      {/* 購票須知 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
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

export default PerformanceTicketsPage;