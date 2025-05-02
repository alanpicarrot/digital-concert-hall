import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
// Add missing imports for icons
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShoppingCart,
  Ticket as TicketIcon,
} from "lucide-react";
import concertService from "../../services/concertService";
import ticketService from "../../services/ticketService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";

const TicketDetailPage = () => {
  // Update useParams to get both performanceId and ticketId
  const { performanceId, ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const expectedTicketType = searchParams.get("type");
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
        setTypeMismatch(false); // Reset type mismatch state

        let ticketData = null;
        let concertData = null;

        // 1. Fetch ticket details using ticketId
        console.log(
          `使用 ticketService.getTicketById(${ticketId}) 獲取票券數據 (演出場次 ID: ${performanceId})`
        );
        try {
          // Use ticketId for fetching
          ticketData = await ticketService.getTicketById(ticketId);
          setTicket(ticketData);
        } catch (ticketError) {
          console.error(
            "使用 ticketService.getTicketById 獲取票券時發生錯誤:",
            ticketError
          );
          if (ticketError.response && ticketError.response.status === 401) {
            const shouldLogin =
              window.confirm("查看票券需要登入。是否前往登入頁面？");
            if (shouldLogin) {
              // Construct redirect URL carefully using the new format
              const redirectPath = `/tickets/${performanceId}/${ticketId}${location.search}`;
              navigate("/login?redirect=" + encodeURIComponent(redirectPath));
              return; // Stop execution after navigation
            } else {
              setError("需要登入才能查看此票券。");
              setLoading(false);
              return; // Stop if user cancels login
            }
          } else if (
            ticketError.response &&
            ticketError.response.status === 404
          ) {
            setError("找不到指定的票券。");
            setLoading(false);
            return; // Stop if ticket not found
          }
          // For other errors, rethrow to be caught by the outer catch block
          throw ticketError;
        }

        // 2. If ticket data is fetched successfully, proceed
        if (ticketData) {
          // 2a. Check for ticket type mismatch if expectedTicketType exists
          if (expectedTicketType && ticketData.ticketType) {
            const normalizeString = (str) => {
              if (!str) return "";
              return str.toLowerCase().replace(/[\s-_]/g, "");
            };
            const normalizedRequestType = normalizeString(expectedTicketType);
            const normalizedResponseType = normalizeString(
              ticketData.ticketType.name
            );

            if (normalizedResponseType !== normalizedRequestType) {
              const isVipRequest = normalizedRequestType.includes("vip");
              const isVipResponse = normalizedResponseType.includes("vip");
              const isStandardRequest =
                normalizedRequestType.includes("標準") ||
                normalizedRequestType.includes("一般");
              const isStandardResponse =
                normalizedResponseType.includes("標準") ||
                normalizedResponseType.includes("一般");

              if (
                (isVipRequest && !isVipResponse) ||
                (isStandardRequest && !isStandardResponse)
              ) {
                console.warn(
                  "票券類型不匹配，期望:",
                  expectedTicketType,
                  "實際:",
                  ticketData.ticketType.name
                );
                setTypeMismatch(true);
              }
            }
          }

          // 2b. Fetch concert details using the concertId from the ticket's performance data
          if (ticketData.performance && ticketData.performance.concertId) {
            console.log(
              `獲取音樂會資訊: concertId=${ticketData.performance.concertId}`
            );
            try {
              concertData = await concertService.getConcertById(
                ticketData.performance.concertId
              );
              setConcert(concertData);
            } catch (concertError) {
              console.error("獲取音樂會詳情時發生錯誤:", concertError);
              setError("無法獲取相關音樂會資訊，但票券資訊已載入。");
            }
          } else {
            console.error("票券數據中缺少 performance 或 concertId");
            setError("無法從票券資訊中獲取關聯的音樂會ID。");
          }
        } else {
          throw new Error("未能獲取票券數據");
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        if (!error) {
          setError("無法載入票券頁面，請稍後再試。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
    // Update dependency array
  }, [performanceId, ticketId, expectedTicketType, navigate, location]);

  // 處理數量變更
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (ticket?.availableQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  // 計算總價
  const calculateTotal = () => {
    if (!ticket) return 0;
    const total = ticket.price * quantity;
    // 確保返回的是有效數字
    return isNaN(total) ? 0 : total;
  };

  // 處理加入購物車
  const handleAddToCart = () => {
    if (!ticket) return;

    // 檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();

    console.log("購物車 - 用戶登入狀態:", {
      user: currentUser ? currentUser.username : "未登入",
      tokenValid: isTokenValid ? "有效" : "無效或過期",
    });

    // 檢查用戶是否已登入
    if (!currentUser || !isTokenValid) {
      // 使用更友好的提示
      const confirmLogin = window.confirm("請先登入才能將商品加入購物車。要前往登入頁面嗎？");
      if (!confirmLogin) return;

      // 先清除已失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();
      }

      // 使用一致的路徑格式
      const redirectPath = `/tickets/${performanceId}/${ticketId}${location.search}`;
      navigate("/login?redirect=" + encodeURIComponent(redirectPath));
      return;
    }

    // 創建購物車項目
    const cartItem = {
      id: ticket.id,
      type: "ticket",
      name: `${concert.title} - ${ticket.ticketType.name}`,
      price: ticket.price,
      quantity: quantity,
      date: ticket.performance.startTime,
      concertId: concert.id,
      performanceId: performanceId, // Add performanceId if needed by cart logic
    };

    // 添加到購物車
    cartService.addToCart(cartItem);

    // 成功提示
    alert(
      `已將 ${quantity} 張 ${
        ticket.ticketType.name
      } 加入購物車，總金額：NT$ ${calculateTotal()}`
    );
  };

  // 處理立即購買
  const handleBuyNow = () => {
    if (!ticket) {
      console.error("無法購買: 票券信息缺失");
      alert("票券信息無效，請重新選擇票券");
      return;
    }

    // 檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();

    console.log("票券頁面 - 用戶登入狀態:", {
      user: currentUser ? currentUser.username : "未登入",
      tokenValid: isTokenValid ? "有效" : "無效或過期",
      ticketId: ticket.id,
      concertId: concert?.id,
    });

    // 檢查用戶是否已登入
    if (!currentUser || !isTokenValid) {
      // 如果未登入，導向登入頁面
      alert("請先登入才能進行購票");

      // 先清除已失效的登入狀態
      if (!isTokenValid && currentUser) {
        authService.logout();
      }

      // Fix: Use performanceId and ticketId for the redirect URL
      const redirectPath = `/tickets/${performanceId}/${ticketId}${location.search}`;
      navigate("/login?redirect=" + encodeURIComponent(redirectPath));
      return;
    }

    try {
      // 將購票信息存入 sessionStorage
      const ticketInfo = {
        concertId: concert.id,
        concertTitle: concert.title,
        performanceId: performanceId,
        ticketId: ticket.id,
        ticketType: ticket.ticketType.name,
        ticketPrice: ticket.price,
        quantity: quantity,
        totalAmount: calculateTotal(),
        purchaseTime: new Date().toISOString(),
        performanceTime: ticket.performance?.startTime,
        venue: ticket.performance?.venue,
        // 新增更完整的票券信息
        source: 'ticketDetail',
        ticketTypeId: ticket.ticketType.id,
        ticketTypeDescription: ticket.ticketType.description,
        // 確保所有價格計算都是有效數字
        subtotal: isNaN(ticket.price * quantity) ? 0 : (ticket.price * quantity)
      };

      sessionStorage.setItem("checkoutInfo", JSON.stringify(ticketInfo));
      console.log("已將購票信息存入sessionStorage (來自票券詳情):", ticketInfo);
      console.log("準備導向到結帳頁面: /checkout");

      // 導航到結帳頁面
      navigate("/checkout", {
        state: {
          // 更新來源路徑
          from: `/tickets/${performanceId}/${ticketId}${location.search}`,
          // 可以保留 direct: true 或使用 source: 'ticketDetail' 來判斷
          direct: true,
          source: 'ticketDetail', // 明確標示來源
          authenticated: true, // 假設此時用戶已驗證
        },
      });
    } catch (error) {
      console.error("處理立即購買時發生錯誤:", error);
      alert("處理購票資訊時發生錯誤，請重試");
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

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
    if (!dateString) return "";

    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString("zh-TW", options);
  };

  // 計算演出時長（分鐘）
  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;

    return Math.floor(durationMs / (1000 * 60)) + " 分鐘";
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
          {/* Update link back to performance tickets or general tickets */}
          <Link
            to={`/performances/${performanceId}/tickets`}
            className="inline-flex items-center text-red-700 hover:text-red-900"
          >
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          找不到票券或音樂會
        </h1>
        <p className="text-gray-600 mb-8">
          您要查詢的票券不存在、已售完或關聯的音樂會資訊無法載入。
        </p>
        {/* Update link back to performance tickets or general tickets */}
        <Link
          to={`/performances/${performanceId}/tickets`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft size={20} />
          <span>返回票券列表</span>
        </Link>
      </div>
    );
  }

  // Ensure all icons used below are imported from lucide-react
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 麵包屑導航 */}
      <div className="text-sm text-gray-500 mb-6">
        <div className="flex items-center space-x-2">
          <Link to="/" className="hover:text-indigo-600">
            首頁
          </Link>
          <span>/</span>
          <Link to="/concerts" className="hover:text-indigo-600">
            音樂會
          </Link>
          <span>/</span>
          <Link
            to={`/concerts/${concert.id}`}
            className="hover:text-indigo-600"
          >
            {concert.title}
          </Link>
          <span>/</span>
          {/* Link back to the specific performance's ticket selection */}
          <Link
            to={`/performances/${performanceId}/tickets`}
            className="hover:text-indigo-600"
          >
            選擇票種
          </Link>
          <span>/</span>
          <span className="text-gray-700">購票確認</span>
        </div>
      </div>

      {/* Type Mismatch Warning */}
      {typeMismatch && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* You might need AlertTriangle icon here */}
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                注意：您正在查看的票券類型與您點擊的連結不符。這可能是因為URL參數發生了變更，或者您選擇的票券類型已售罄。請確認您選擇的是正確的票券。
                <Link
                  to={`/performances/${performanceId}/tickets`}
                  className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2"
                >
                  返回選擇票種
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Ticket Details */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {concert.title}
          </h1>
          <h2 className="text-xl font-semibold text-indigo-600 mb-6">
            {ticket.ticketType.name}
          </h2>

          {/* Performance Info */}
          <div className="space-y-4 text-gray-700 mb-8">
            <div className="flex items-center">
              <Calendar size={20} className="text-indigo-500 mr-3" />
              <span>{formatDate(ticket.performance.startTime)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={20} className="text-indigo-500 mr-3" />
              <span>{formatTime(ticket.performance.startTime)} 開始</span>
            </div>
            <div className="flex items-center">
              <Clock size={20} className="text-indigo-500 mr-3 opacity-0" />{" "}
              {/* Placeholder for alignment */}
              <span className="ml-[calc(20px+0.75rem)] text-sm text-gray-500">
                演出時長：
                {getDuration(
                  ticket.performance.startTime,
                  ticket.performance.endTime
                )}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin size={20} className="text-indigo-500 mr-3" />
              <span>{ticket.performance.venue || "場地待定"}</span>
            </div>
            <div className="flex items-center">
              <TicketIcon size={20} className="text-indigo-500 mr-3" />
              <span>剩餘數量：{ticket.availableQuantity} 張</span>
            </div>
          </div>

          {/* Ticket Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              票券說明
            </h3>
            <p className="text-gray-600">
              {ticket.ticketType.description || "此票券暫無詳細說明。"}
            </p>
          </div>

          {/* Concert Description */}
          {concert.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                音樂會詳情
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {concert.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Purchase Box */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              選擇數量
            </h3>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= ticket.availableQuantity}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              最多可購買 {ticket.availableQuantity} 張
            </p>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">單價：</span>
                <span className="font-semibold">NT$ {ticket.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">數量：</span>
                <span className="font-semibold">{quantity} 張</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>總計金額：</span>
                <span>NT$ {calculateTotal()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>加入購物車</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
              >
                <CreditCard size={20} />
                <span>立即購買</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
