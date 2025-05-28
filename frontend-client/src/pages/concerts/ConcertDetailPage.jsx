import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  MapPin,
  User,
  Music,
  Ticket,
  Star,
  Info,
  ShoppingCart,
  Clock, // 新增 Clock icon
  Minus, // 新增 Minus icon
  Plus,  // 新增 Plus icon
} from "lucide-react";
import concertService from "../../services/concertService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import storageService from "../../services/storageService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";
import { formatDate, formatTime } from "../../utils/dateUtils"; // 導入共享函數

const ConcertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("tickets"); // 預設顯示票券
  const [ticketQuantities, setTicketQuantities] = useState({}); // 新增 state 來管理票券數量

  // useEffect to fetch concert details (保持不變，確保 concert.performances 被正確設置)
  useEffect(() => {
    const fetchConcertDetails = async () => {
      if (!id) {
        setError("無效的音樂會ID");
        setLoading(false); // Set loading to false if ID is invalid
        return;
      }

      try {
        setLoading(true);
        console.log(`正在勾取音樂會ID=${id}的詳情資料`);
        const concertData = await concertService.getConcertById(id);
        console.log(`從服務獲取的音樂會資料:`, concertData);

        if (!concertData) {
          console.error("音樂會數據為空或無效");
          setError("找不到該音樂會");
          setLoading(false);
          return;
        }

        const concertDetails = {
          id: concertData.id,
          title: concertData.title || "未命名音樂會",
          performer: concertData.performer || "未知表演者",
          performerTitle: concertData.performerTitle || "",
          address: concertData.address || "",
          image: concertData.posterUrl || null,
          imageText: concertData.title || "音樂會圖片",
          description: concertData.description || "暫無活動說明",
          organizer: concertData.organizer || "",
          organizerContact: concertData.organizerContact || "",
          organizerEmail: concertData.organizerEmail || "",
          performerBio: concertData.performerBio || "暫無表演者資料",
          program: concertData.programDetails
            ? concertData.programDetails
                .split("\n")
                .filter((line) => line.trim().length > 0)
                .map((line, index) => ({
                  name: line.trim(),
                  duration: concertData.programDurations?.[index] || "",
                }))
            : [],
          performances: concertData.performances || [], // 確保 performances 被設置
          galleryItems: concertData.galleryItems || [],
        };

        console.log("格式化後的音樂會詳情:", concertDetails);
        setConcert(concertDetails);

        // Initialize ticket quantities based on fetched data
        const initialQuantities = {};
        concertDetails.performances.forEach(perf => {
          perf.tickets?.forEach(ticket => {
            // *** 修改這裡：預設值改為 0 ***
            initialQuantities[`${perf.id}-${ticket.id}`] = 0;
          });
        });
        setTicketQuantities(initialQuantities);


        storageService.history.addConcert({
          id: concertData.id,
          title: concertData.title,
          posterUrl: concertData.posterUrl,
        });
      } catch (error) {
        console.error("Error fetching concert details:", error);
        setError(`無法載入音樂會詳情: ${error.message || '未知錯誤'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConcertDetails();
  }, [id]);


  const formatTime = (dateString) => {
    if (!dateString) return "時間未知";
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    try {
      return new Date(dateString).toLocaleTimeString("zh-TW", options);
    } catch (e) { return "時間無效"; }
  };

  // --- 加入新的函數 ---
  const handleAddToCartSpecific = (ticketId, performanceId, quantityToAdd) => {
    // 檢查 concert 是否已載入
    if (!concert) {
      console.error("handleAddToCartSpecific called but concert state is null!");
      alert("無法處理購物車操作，音樂會資料尚未載入。請稍後再試。");
      return;
    }

    // 查找目標票券和演出場次
    let targetTicket = null;
    let targetPerformance = null;

    if (concert.performances) {
      for (const perf of concert.performances) {
        if (perf.id === performanceId && perf.tickets) {
          targetTicket = perf.tickets.find(t => t.id === ticketId);
          if (targetTicket) {
            targetPerformance = perf;
            break;
          }
        }
      }
    }

    if (!targetTicket || !targetPerformance) {
      alert("無法找到要加入購物車的票券資訊。");
      console.error("Could not find ticket or performance for AddToCart:", { ticketId, performanceId });
      return;
    }

    // 驗證數量
    const numQuantityToAdd = Number(quantityToAdd);
    if (isNaN(numQuantityToAdd) || numQuantityToAdd <= 0) {
      alert("請選擇有效的票券數量 (至少一張)。");
      // 重置該票券數量為 1 (可選)
      // handleQuantityChange(ticketId, 1, targetTicket.availableQuantity);
      return;
    }

    if (numQuantityToAdd > targetTicket.availableQuantity) {
       alert(`抱歉，${targetTicket.ticketType?.name || '此票券'} 僅剩 ${targetTicket.availableQuantity} 張。您選擇了 ${numQuantityToAdd} 張。`);
       // 可以選擇將數量重置為最大可用數量
       // handleQuantityChange(ticketId, targetTicket.availableQuantity, targetTicket.availableQuantity);
       return;
    }

    // 檢查登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();
    if (!currentUser || !isTokenValid) {
      const confirmLogin = window.confirm("請先登入才能將商品加入購物車。要前往登入頁面嗎？");
      if (!confirmLogin) return;
      if (!isTokenValid && currentUser) authService.logout(); // 如果 token 無效但 user 存在，登出
      const redirectPath = location.pathname + location.search;
      navigate("/login?redirect=" + encodeURIComponent(redirectPath));
      return;
    }

    // 準備購物車項目
    const cartItem = {
      id: targetTicket.id, // 使用票券 ID 作為購物車項目 ID
      type: 'ticket',
      name: targetTicket.ticketType?.name || '票券', // 使用票種名稱
      price: targetTicket.price,
      quantity: numQuantityToAdd,
      concertId: concert.id, // 從 concert 狀態獲取
      concertTitle: concert.title, // 從 concert 狀態獲取
      performanceId: targetPerformance.id,
      performanceTime: targetPerformance.startTime,
      image: concert.image, // 從 concert 狀態獲取
      ticketTypeId: targetTicket.ticketType?.id, // 包含票種 ID
      availableQuantity: targetTicket.availableQuantity, // 將可用數量也傳遞給購物車服務可能有用
      // 可根據購物車服務需要添加其他資訊
    };

    console.log("準備加入購物車:", cartItem);

    try {
      cartService.addToCart(cartItem);
      alert(`${cartItem.name} x ${cartItem.quantity} 已成功加入購物車！`);
      // 可選：加入成功後重置該票券數量為 1
      // handleQuantityChange(ticketId, 1, targetTicket.availableQuantity);
      // 觸發購物車更新事件，讓 Header 等組件可以更新購物車圖標數量
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("加入購物車失敗:", error);
      alert(`加入購物車時發生錯誤: ${error.message || '請稍後再試'}`);
    }
  };


  // 新增：處理票券數量變更的函數
  const handleQuantityChange = (performanceId, ticketTypeId, change) => {
    setTicketQuantities(prevQuantities => {
      const key = `${performanceId}-${ticketTypeId}`;
      // *** 修改這裡：預設值改為 0 ***
      const currentQuantity = prevQuantities[key] || 0;
      // *** 修改這裡：最小值改為 0 ***
      const newQuantity = Math.max(0, currentQuantity + change);

      // 這裡可以加入檢查剩餘票數的邏輯 (如果需要)
      // const targetPerformance = concert?.performances.find(p => p.id === performanceId);
      // const targetTicket = targetPerformance?.tickets.find(t => t.id === ticketTypeId);
      // const remaining = targetTicket?.availableQuantity ?? Infinity;
      // if (newQuantity > remaining) {
      //   return prevQuantities; // 或者設置為 remaining
      // }

      return {
        ...prevQuantities,
        [key]: newQuantity,
      };
    });
  };

  // 新增：處理加入購物車的函數
  const handleAddToCart = (performanceId, ticket) => { // 'ticketType' 參數已更名為 'ticket' 以反映其內容
    const quantityKey = `${performanceId}-${ticket.id}`;
    const quantity = ticketQuantities[quantityKey] || 0;

    if (quantity === 0) {
      alert("請先選擇票券數量。");
      return;
    }

    if (!authService.isAuthenticated()) {
      storageService.session.set('redirectPath', location.pathname);
      navigate("/login", { state: { message: "請先登入才能將票券加入購物車" } });
      return;
    }

    console.log(`Adding to cart: Performance ID ${performanceId}, Ticket ID ${ticket.id}, Quantity ${quantity}, Price ${ticket.price}`);

    // 構建傳遞給購物車服務的項目對象
    const cartItem = {
      id: ticket.id, // 使用票券自身的 ID
      type: 'ticket',
      name: ticket.name || '票券', // 從票券對象獲取名稱
      price: ticket.price,       // 從票券對象獲取價格 (關鍵修復)
      quantity: quantity,
      concertId: concert?.id,    // 從 concert state 獲取
      concertTitle: concert?.title, // 從 concert state 獲取
      performanceId: performanceId, // 已傳入的演出場次 ID
      image: concert?.image,       // 從 concert state 獲取
      // ticketTypeId: ticket.id, // 如果 item.id 就是票種 ID，此欄位可選
    };

    // 建議使用 cartService.addToCart，因為它是 cartService.js 中實際返回 Promise 的函數名
    // addItem 是您在 cartService.js 中為 addToCart 設置的別名
    cartService.addToCart(cartItem) // 或者繼續使用 cartService.addItem(cartItem) 如果您偏好
      .then(() => {
        console.log("成功加入購物車:", cartItem);
        // 可選：成功加入後重置此票券的選擇數量
        // setTicketQuantities(prevQuantities => ({
        //   ...prevQuantities,
        //   [quantityKey]: 0,
        // }));
        alert(`${cartItem.name} x ${cartItem.quantity} 已成功加入購物車！`);
        navigate('/cart'); // 導航到購物車頁面
      })
      .catch(err => {
        console.error("加入購物車失敗:", err);
        setError(err.response?.data?.message || "加入購物車時發生錯誤，請稍後再試");
        alert(`加入購物車失敗: ${err.response?.data?.message || err.message || '請稍後再試'}`);
      });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... loading, error, breadcrumb, header ... */}
       {loading && (
         <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
         </div>
       )}
       {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded">{error}</div>}
       {!loading && !error && !concert && (
         <div className="text-center py-10">
           <h1 className="text-2xl font-bold text-gray-800 mb-4">找不到音樂會</h1>
           <p className="text-gray-600 mb-8">抱歉，您要查詢的音樂會不存在或已被移除。</p>
           <Link to="/concerts" className="text-indigo-600 hover:underline">返回音樂會列表</Link>
         </div>
       )}

       {concert && (
         <>
           {/* Header Section */}
           <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
             {/* ... header content using concert data ... */}
              <div className="relative">
                {concert.image ? ( <img src={concert.image} alt={concert.title} className="w-full h-96 object-cover"/>) : (<SimplePlaceholder height={384} text={concert.title} />) }
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 text-white">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{concert.title}</h1>
                    <div className="flex items-center mb-1"> <User size={18} className="mr-2" /> <span className="text-lg">{concert.performer}</span> {concert.performerTitle && <><span className="mx-2">-</span><span>{concert.performerTitle}</span></>} </div>
                    {/* --- 修改開始 --- */}
                    {concert.performances && concert.performances.length > 0 && (
                      <div className="mt-3 space-y-1 text-sm">
                        {concert.performances.length === 1 ? (
                          // 只有一個場次
                          <>
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 opacity-80" />
                              {/* 使用導入的函數 */}
                              <span>{formatDate(concert.performances[0].startTime, 'zh-TW', { year: "numeric", month: "long", day: "numeric", weekday: "long" })} {formatTime(concert.performances[0].startTime)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2 opacity-80" />
                              <span>{concert.performances[0].venue}</span>
                            </div>
                          </>
                        ) : (
                          // 有多個場次
                          <>
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 opacity-80" />
                              {/* 使用導入的函數 */}
                              <span>
                                {formatDate(concert.performances[0].startTime, 'zh-TW', { year: "numeric", month: "long", day: "numeric", weekday: "long" })} - {formatDate(concert.performances[concert.performances.length - 1].startTime, 'zh-TW', { year: "numeric", month: "long", day: "numeric", weekday: "long" })} ({concert.performances.length} 場次)
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin size={16} className="mr-2 opacity-80" />
                              {/* 顯示第一個場地的名稱，如果有多個不同地點則提示 */}
                              <span>{concert.performances[0].venue} {concert.performances.some(p => p.venue !== concert.performances[0].venue) ? '(及其他地點)' : ''}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {/* --- 修改結束 --- */}
                  </div>
                </div>
              </div>
           </div>

           {/* Main Content Area */}
           {/* 移除 lg:grid-cols-3，使其在所有尺寸下都是 grid-cols-1 */}
           <div className="grid grid-cols-1 gap-8">
             {/* Left Column: Tabs and Content */}
             {/* 移除 lg:col-span-2，因為現在是單欄 */}
             <div>
               {/* Tab Navigation */}
               <div className="border-b border-gray-200">
                 {/* 將 border 移到這裡 */}
                 <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                   {[
                     { id: "tickets", label: "購票資訊", icon: Ticket },
                     { id: "description", label: "音樂會介紹", icon: Info },
                     { id: "program", label: "節目單", icon: Music },
                     { id: "performer", label: "表演者", icon: User },
                     { id: "reviews", label: "評論", icon: Star },
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                         activeTab === tab.id
                           ? "border-indigo-500 text-indigo-600"
                           : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                       }`}
                     >
                       <tab.icon size={18} className="mr-2" />
                       {tab.label}
                     </button>
                   ))}
                 </nav>
               </div>

               {/* Tab Content - 現在放在 lg:col-span-2 內部 */}
               <div className="mt-6">
                 {activeTab === 'tickets' && (
                   <div>
                     <h3 className="text-xl font-semibold mb-4">選擇場次與票券</h3>
                     {concert.performances && concert.performances.length > 0 ? (
                       <div className="space-y-6">
                         {concert.performances.map((performance) => (
                           <div key={performance.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                             {/* 場次資訊 */}
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
                               {/* ... (場次資訊內容) ... */}
                               <div>
                                 <h4 className="text-lg font-medium text-indigo-700">
                                   {formatDate(performance.startTime, 'zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                 </h4>
                                 <div className="flex items-center text-gray-600 mt-1 text-sm">
                                   <Clock size={14} className="mr-1.5" />
                                   <span>{formatTime(performance.startTime)}</span>
                                   <MapPin size={14} className="ml-3 mr-1.5" />
                                   <span>{performance.venue || concert.venue || '場地未定'}</span>
                                 </div>
                               </div>
                             </div>

                             {/* 票券類型列表 */}
                             {performance.tickets && performance.tickets.length > 0 ? (
                               <div className="space-y-4">
                                 {performance.tickets.map((ticket) => {
                                   const quantityKey = `${performance.id}-${ticket.id}`;
                                   const currentQuantity = ticketQuantities[quantityKey] || 0;
                                   const remainingTickets = ticket.availableQuantity ?? Infinity;

                                   return (
                                     // *** 修改這裡：確保是 flex 佈局並在 sm 螢幕以上為 row ***
                                     <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                                       {/* *** 恢復這裡：票券資訊 *** */}
                                       <div className="mb-2 sm:mb-0 flex-grow mr-4">
                                         <p className="font-semibold text-gray-800">{ticket.name || '票種名稱'}</p>
                                         <p className="text-sm text-gray-600">NT$ {ticket.price}</p>
                                         {ticket.description && <p className="text-xs text-gray-500 mt-1">{ticket.description}</p>}
                                         {remainingTickets !== Infinity && (
                                           <p className={`text-sm mt-1 ${remainingTickets <= 10 && remainingTickets > 0 ? 'text-red-600 font-medium' : (remainingTickets === 0 ? 'text-red-700 font-bold' : 'text-green-600')}`}>
                                             {remainingTickets > 0 ? `剩餘 ${remainingTickets} 張` : '已售完'}
                                           </p>
                                         )}
                                       </div>
                                       {/* *** 恢復結束 *** */}

                                       {/* 數量選擇器和加入購物車按鈕 - 保持在右側 */}
                                       {/* 使用 flex-shrink-0 避免被壓縮 */}
                                       <div className="flex items-center space-x-3 flex-shrink-0">
                                         {remainingTickets > 0 && ( // 只有還有票時才顯示選擇器和按鈕
                                           <>
                                             {/* 數量選擇器 */}
                                             <div className="flex items-center border border-gray-300 rounded">
                                               <button
                                                 onClick={() => handleQuantityChange(performance.id, ticket.id, -1)}
                                                 disabled={currentQuantity <= 0}
                                                 className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-l focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                 aria-label="減少數量"
                                               >
                                                 <Minus size={16} />
                                               </button>
                                               <span className="px-3 py-1 text-center w-12 border-l border-r border-gray-300 bg-white">
                                                 {currentQuantity}
                                               </span>
                                               <button
                                                 onClick={() => handleQuantityChange(performance.id, ticket.id, 1)}
                                                 disabled={currentQuantity >= remainingTickets}
                                                 className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-r focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                 aria-label="增加數量"
                                               >
                                                 <Plus size={16} />
                                               </button>
                                             </div>
                                             {/* 加入購物車按鈕 */}
                                             <button
                                               onClick={() => handleAddToCart(performance.id, ticket)}
                                               disabled={currentQuantity === 0 || remainingTickets === 0}
                                               className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                             >
                                               <ShoppingCart size={16} className="mr-1.5" />
                                               加入購物車
                                             </button>
                                           </>
                                         )}
                                         {/* 如果已售完，顯示提示 */}
                                         {remainingTickets === 0 && (
                                           <span className="text-sm font-medium text-red-600">已售完</span>
                                         )}
                                       </div>
                                     </div>
                                   );
                                 })}
                               </div>
                             ) : (
                               <p className="text-gray-500 text-sm">此場次暫無票券可選。</p>
                             )}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-gray-500">此音樂會目前沒有演出場次或票券資訊。</p>
                     )}
                   </div>
                 )}

                 {/* ... (其他 Tab Content) ... */}
               </div>
             </div>
           </div>
         </>
       )}
    </div>
  );
};

export default ConcertDetailPage;