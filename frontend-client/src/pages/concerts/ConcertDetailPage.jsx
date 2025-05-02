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
  ShoppingCart
} from "lucide-react";
import concertService from "../../services/concertService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import storageService from "../../services/storageService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";

const ConcertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets");
  const [error, setError] = useState(null);
  const [ticketQuantities, setTicketQuantities] = useState({});

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

        // Initialize ticket quantities based on fetched data (optional, but good practice)
        const initialQuantities = {};
        concertDetails.performances.forEach(perf => {
          perf.tickets?.forEach(ticket => {
            initialQuantities[ticket.id] = 1; // Default to 1 or 0 as needed
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

  // formatDate and formatTime (保持不變)
  const formatDate = (dateString) => {
    if (!dateString) return "日期未知";
    const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
    try {
      return new Date(dateString).toLocaleDateString("zh-TW", options);
    } catch (e) { return "日期無效"; }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "時間未知";
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    try {
      return new Date(dateString).toLocaleTimeString("zh-TW", options);
    } catch (e) { return "時間無效"; }
  };

  // handleQuantityChange (保持不變)
  const handleQuantityChange = (ticketId, newQuantityStr, availableQuantity) => {
    // --- 修改開始 ---
    // 將輸入值轉換為數字，如果無效則預設為 1
    const parsedQuantity = parseInt(newQuantityStr, 10);
    const newQuantity = isNaN(parsedQuantity) ? 1 : parsedQuantity;

    // 確保數量在有效範圍內 (至少 1，最多不超過可用數量)
    const quantity = Math.max(1, Math.min(newQuantity, availableQuantity || 1));
    // --- 修改結束 ---

    setTicketQuantities((prevQuantities) => ({
      ...prevQuantities,
      [ticketId]: quantity,
    }));
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


  // ... existing loading, error, and render logic ...
  // 確保渲染邏輯中的 onClick={...} 調用的是 handleAddToCartSpecific

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
                    {concert.performances && concert.performances.length > 0 && (
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center"> <Calendar size={16} className="mr-2 opacity-80" /> <span>{formatDate(concert.performances[0].startTime)} {formatTime(concert.performances[0].startTime)}</span> </div>
                        <div className="flex items-center"> <MapPin size={16} className="mr-2 opacity-80" /> <span>{concert.performances[0].venue}</span> </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>

           {/* Main Content Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Tabs */}
             <div className="lg:col-span-2">
               {/* Tab Navigation */}
               <div className="border-b border-gray-200 mb-6">
                 <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                   {[ { id: "tickets", label: "購票資訊", icon: Ticket }, { id: "description", label: "音樂會介紹", icon: Info }, { id: "program", label: "節目單", icon: Music }, { id: "performer", label: "表演者", icon: User }, { id: "reviews", label: "評論", icon: Star }, ].map((tab) => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" }`} > <tab.icon size={18} className="mr-2" /> {tab.label} </button> ))}
                 </nav>
               </div>

               {/* Tab Content */}
               <div className="bg-white rounded-xl p-6 shadow-md min-h-[300px]"> {/* Added min-height */}
                 {/* Tickets Tab */}
                 {activeTab === 'tickets' && (
                   <div>
                     <h2 className="text-2xl font-bold mb-6 text-gray-800">購票資訊</h2>
                     {concert.performances && concert.performances.length > 0 ? (
                       <div className="space-y-8">
                         {concert.performances.map((performance) => (
                           <div key={performance.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                             {/* Performance Header */}
                             <div className="bg-gray-50 p-4 border-b border-gray-200">
                               <h3 className="text-lg font-semibold text-gray-800 flex items-center"> <Calendar size={18} className="mr-2 text-indigo-600" /> 演出場次: {formatDate(performance.startTime)} </h3>
                               <div className="flex items-center text-sm text-gray-600 mt-1 ml-7"> <MapPin size={14} className="mr-1.5" /> {performance.venue || '地點未定'} </div>
                             </div>
                             {/* Tickets for this Performance */}
                             <div className="p-4 md:p-6">
                               {performance.tickets && performance.tickets.length > 0 ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {performance.tickets.map((ticket) => {
                                     // --- 修改開始 ---
                                     const ticketInfo = {
                                       id: ticket.id,
                                       type: ticket.name || '未知票種', // 直接從 ticket.name 讀取
                                       description: ticket.description || '', // 直接從 ticket.description 讀取
                                       price: ticket.price, // 保持讀取 ticket.price (後端需修正 null 值)
                                       availableQuantity: ticket.availableQuantity,
                                       // 暫時移除或使用預設顏色，因為 API 沒有提供 colorCode
                                       colorCode: '#cccccc', // 使用預設灰色
                                     };
                                     // --- 修改結束 ---
                                     const currentQuantity = ticketQuantities[ticket.id] || 1; // Default to 1

                                     return (
                                       <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                                         <div>
                                           <div className="flex items-center mb-2">
                                             {/* 使用更新後的 ticketInfo.colorCode */}
                                             <span style={{ backgroundColor: ticketInfo.colorCode }} className="w-4 h-4 rounded-full mr-2 inline-block flex-shrink-0"></span>
                                             {/* 使用更新後的 ticketInfo.type */}
                                             <h4 className="font-bold text-lg text-indigo-700 break-words">{ticketInfo.type}</h4>
                                           </div>
                                           {/* 使用更新後的 ticketInfo.description */}
                                           <p className="text-gray-600 text-sm mt-1 mb-3 break-words">{ticketInfo.description}</p>
                                           {/* 價格顯示 (如果後端修正了 null，這裡就能正確顯示) */}
                                           <p className="text-xl font-semibold mb-3">NT$ {(ticketInfo.price ?? 0).toLocaleString()}</p>
                                           <p className={`text-sm mb-4 font-medium ${ticketInfo.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                             {ticketInfo.availableQuantity > 0 ? `剩餘 ${ticketInfo.availableQuantity} 張` : '已售罄'}
                                           </p>
                                         </div>
                                         {ticketInfo.availableQuantity > 0 && (
                                           <div className="mt-auto pt-4"> {/* Push controls to bottom */}
                                             {/* ... quantity input and add to cart button ... */}
                                             <div className="flex items-center space-x-2 mb-4">
                                               <label htmlFor={`qty-${ticket.id}`} className="text-sm font-medium text-gray-700">數量:</label>
                                               <input type="number" id={`qty-${ticket.id}`} min="1" max={ticketInfo.availableQuantity} value={currentQuantity} onChange={(e) => handleQuantityChange(ticket.id, e.target.value, ticketInfo.availableQuantity)} className="w-20 p-1 border border-gray-300 rounded text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" disabled={ticketInfo.availableQuantity <= 0} />
                                             </div>
                                             <button onClick={() => handleAddToCartSpecific(ticket.id, performance.id, currentQuantity)} disabled={ticketInfo.availableQuantity <= 0 || currentQuantity <= 0 || isNaN(currentQuantity)} className={`w-full py-2 px-4 rounded font-medium text-white flex items-center justify-center transition-colors duration-200 ${ticketInfo.availableQuantity > 0 && currentQuantity > 0 && !isNaN(currentQuantity) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`} > <ShoppingCart size={16} className="mr-2"/> 加入購物車 </button>
                                           </div>
                                         )}
                                       </div>
                                     );
                                   })}
                                 </div>
                               ) : ( <p className="text-gray-500 text-center py-4">此演出場次目前無可售票券。</p> )}
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center py-10 px-6 bg-gray-50 rounded-lg"> <Info size={48} className="mx-auto text-gray-400 mb-4" /> <p className="text-gray-600">此音樂會目前沒有排定演出場次或無可售票券。</p> <p className="text-sm text-gray-500 mt-2">請稍後再回來查看，或聯繫主辦單位。</p> </div>
                     )}
                   </div>
                 )}

                 {/* Other Tabs */}
                 {activeTab === 'description' && ( <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: concert.description || '<p>暫無詳細介紹</p>' }} /> )}
                 {activeTab === 'program' && ( <div> <h2 className="text-2xl font-bold mb-4">節目單</h2> {concert.program && concert.program.length > 0 ? ( <ul className="list-disc pl-5 space-y-2"> {concert.program.map((item, index) => <li key={index}>{item.name} {item.duration && `(${item.duration})`}</li>)} </ul> ) : ( <p>暫無節目資訊</p> )} </div> )}
                 {activeTab === 'performer' && ( <div> <h2 className="text-2xl font-bold mb-4">表演者介紹</h2> <p>{concert.performerBio || '暫無表演者介紹'}</p> </div> )}
                 {activeTab === 'reviews' && ( <div> <h2 className="text-2xl font-bold mb-4">評論</h2> <p>評論功能開發中。</p> </div> )}
               </div>
             </div>

             {/* Right Column: Sidebar (Optional) */}
             {/* <div className="lg:col-span-1"> ... Sidebar content ... </div> */}
           </div>
         </>
       )}
    </div>
  );
};

export default ConcertDetailPage;