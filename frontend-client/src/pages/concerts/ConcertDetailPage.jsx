import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  User,
  Music,
  Ticket,
  ChevronLeft,
  Star,
  Info,
} from "lucide-react";
import concertService from "../../services/concertService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import storageService from "../../services/storageService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";

const ConcertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeatingArea, setSelectedSeatingArea] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tickets");
  const [error, setError] = useState(null);

  // 從後端獲取音樂會詳情
  useEffect(() => {
    const fetchConcertDetails = async () => {
      if (!id) {
        setError("無效的音樂會ID");
        return;
      }

      try {
        setLoading(true);
        console.log(`正在勾取音樂會ID=${id}的詳情資料`);
        // 使用開發的服務獲取音樂會詳情
        const concertData = await concertService.getConcertById(id);
        console.log(`從服務獲取的音樂會資料:`, concertData);

        if (!concertData) {
          console.error("音樂會數據為空或無效");
          setError("找不到該音樂會");
          // 嘗試重新獲取或記錄問題
          console.log(`嘗試發起API測試數據創建請求`);
          try {
            // 嘗試創建測試數據
            const testDataResponse = await fetch('http://localhost:8080/api/concerts/create-spring-concert');
            console.log('測試數據創建結果:', testDataResponse.status);
            if (testDataResponse.ok) {
              // 如果成功創建測試數據，稍等片刻後再次嘗試獲取
              setTimeout(async () => {
                console.log('重新嘗試獲取音樂會數據...');
                const retryData = await concertService.getConcertById(id);
                if (retryData) {
                  setConcert(retryData);
                  setLoading(false);
                  setError(null);
                }
              }, 2000);
            }
          } catch (testDataError) {
            console.error('創建測試數據失敗:', testDataError);
          }
          return;
        }

        // 將API回傳的資料轉換為頁面需要的格式
        const concertDetails = {
          id: concertData.id,
          title: concertData.title,
          performer: "表演者", // 預設得表演者
          performerTitle: "音樂家", // 預設的順位
          date:
            concertData.performances && concertData.performances[0]
              ? concertData.performances[0].startTime
              : new Date().toISOString(),
          location:
            concertData.performances && concertData.performances[0]
              ? concertData.performances[0].venue
              : "數位音樂廳",
          address: "台北市中正區忠孝東路一段123號", // 預設的地址
          // 使用實際圖片或null (將使用本地渲染的佔位圖片)
          image: concertData.posterUrl || null,
          imageText: concertData.title, // 用於渲染佔位圖
          description: concertData.description || "暫無活動說明",
          organizer: "數位音樂廳組委會", // 預設主辦單位
          organizerContact: "02-1234-5678", // 預設聯絡電話
          organizerEmail: "contact@digitalconcerthall.example.com", // 預設電子郵件
          performerBio: concertData.description || "暫無表演者資料",

          // 節目單，從程式細節中解析或使用預設值
          program: concertData.programDetails
            ? concertData.programDetails
                .split("\n")
                .filter((line) => line.trim().length > 0)
                .map((line, index) => ({
                  name: line.trim(),
                  duration: "15分鐘",
                }))
            : [
                { name: "第一樹場曲目", duration: "15分鐘" },
                { name: "第二樹場曲目", duration: "20分鐘" },
              ],

          // 從API接口獲取票券和場次數據
          ticketAreas: concertData.tickets
            ? concertData.tickets.map((ticket) => ({
                id: ticket.id,
                name: `${ticket.ticketType.name} - ${formatDate(
                  ticket.performance.startTime
                )} ${formatTime(ticket.performance.startTime)} ${
                  ticket.performance.venue || "數位音樂廳"
                }`,
                price: ticket.price, // 使用實際票券價格
                available: ticket.availableQuantity, // 使用實際可用票數
                performance: ticket.performance, // 保存場次資訊供立即購票按鈕使用
              }))
            : // 以下為備用數據，僅當API沒有返回票券信息時使用
            concertData.performances
            ? concertData.performances.map((perf, index) => ({
                id: perf.id,
                name: `${formatDate(perf.startTime)} ${formatTime(
                  perf.startTime
                )} ${perf.venue || "數位音樂廳"}`,
                price: 1000, // 默認價格，若需手動調整
                available: 50, // 默認可用票數
                performance: perf, // 保存場次資訊供立即購票按鈕使用
              }))
            : [
                {
                  id: 1,
                  name: "普通座位",
                  price: 1000,
                  available: 50,
                  performance: {
                    id: concertData.id,
                    startTime: new Date().toISOString(),
                  },
                },
                {
                  id: 2,
                  name: "VIP座位",
                  price: 1500,
                  available: 20,
                  performance: {
                    id: concertData.id,
                    startTime: new Date().toISOString(),
                  },
                },
              ],

          // 評論和圖片庫使用預設值
          reviews: [
            { id: 1, user: "觀眾1", rating: 5, comment: "非常精彩的演出！" },
            {
              id: 2,
              user: "觀眾2",
              rating: 4,
              comment: "好聽的音樂，但場地有點小。",
            },
          ],
          // 使用名稱字串陣列來替代URL，會用佔位圖組件渲染
          galleryItems: ["Gallery 1", "Gallery 2", "Gallery 3"],
        };

        setConcert(concertDetails);

        // 將音樂會添加到瀏覽歷史
        storageService.history.addConcert({
          id: concertData.id,
          title: concertData.title,
          posterUrl: concertData.posterUrl,
        });
      } catch (error) {
        console.error("Error fetching concert details:", error);
        setError("無法載入音樂會詳情");
      } finally {
        setLoading(false);
      }
    };

    fetchConcertDetails();
  }, [id]);

  // 日期格式化
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return new Date(dateString).toLocaleDateString("zh-TW", options);
  };

  // 時間格式化
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString("zh-TW", options);
  };

  // 處理選擇座位區域
  const handleSelectSeatingArea = (area) => {
    setSelectedSeatingArea(area);
    setQuantity(1); // 重置數量
  };

  // 處理數量變更
  const handleQuantityChange = (newQuantity) => {
    if (
      newQuantity >= 1 &&
      newQuantity <= (selectedSeatingArea?.available || 10)
    ) {
      setQuantity(newQuantity);
    }
  };

  // 計算總價
  const calculateTotal = () => {
    if (!selectedSeatingArea) return 0;
    return selectedSeatingArea.price * quantity;
  };

  // 處理加入購物車
  const handleAddToCart = () => {
    if (!selectedSeatingArea) return;

    // 清楚檢查用戶登入狀態
    const currentUser = authService.getCurrentUser();
    const isTokenValid = authService.isTokenValid();

    console.log("購物車 - 用戶登入狀態:", {
      user: currentUser ? currentUser.username : "未登入",
      tokenValid: isTokenValid ? "有效" : "無效或過期",
    });
    
    // 如果本地存儲中有 token但不正確，先清除
    if (localStorage.getItem('token') && (!currentUser || !isTokenValid)) {
      console.log('重置狀態：發現令牌有問題');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // 檢查用戶是否已登入並且令牌有效
    if (!currentUser || !isTokenValid) {
      // 如果用戶未登入或令牌無效，導向登入頁面
      console.log("用戶未登入或令牌無效，重定向到登入頁面");
      alert("請先登入才能將商品加入購物車");

      navigate("/login?redirect=" + encodeURIComponent(`/concerts/${id}`));
      return;
    }

    // 創建商品物件用於添加到購物車
    const cartItem = {
      id: concert.id,
      type: "concert",
      name: `${concert.title} - ${selectedSeatingArea.name}`,
      price: selectedSeatingArea.price,
      quantity: quantity,
      date: concert.date,
    };

    // 添加到購物車
    cartService.addToCart(cartItem);

    // 提示用戶加入購物車成功
    alert(
      `已將 ${quantity} 張 ${
        selectedSeatingArea.name
      } 加入購物車，總金額：NT$ ${calculateTotal()}`
    );
  };

  // 處理立即購買
  const handleBuyNow = () => {
    console.log("點擊立即購票按鈕");
    console.log("音樂會數據：", concert);
    // 如果已選擇座位區域，直接使用當前票種進行購買流程
    if (selectedSeatingArea) {
      // 清楚檢查用戶登入狀態
      const currentUser = authService.getCurrentUser();
      const isTokenValid = authService.isTokenValid();

      console.log("票券頁面 - 用戶登入狀態:", {
        user: currentUser ? currentUser.username : "未登入",
        tokenValid: isTokenValid ? "有效" : "無效或過期",
      });
      
      // 如果本地存儲中有 token但不正確，先清除
      if (localStorage.getItem('token') && (!currentUser || !isTokenValid)) {
        console.log('重置狀態：發現令牌有問題');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // 檢查用戶是否已登入並且令牌有效
      if (!currentUser || !isTokenValid) {
        // 如果用戶未登入或令牌無效，導向登入頁面
        console.log("用戶未登入或令牌無效，重定向到登入頁面");
        alert("請先登入才能進行購票");

        navigate("/login?redirect=" + encodeURIComponent(`/concerts/${id}`));
        return;
      }

      // 將購票信息存入 sessionStorage，以便結帳頁面可以使用
      const ticketInfo = {
        concertId: concert.id,
        concertTitle: concert.title,
        ticketId: selectedSeatingArea.id, // 確保添加票券ID
        ticketType: selectedSeatingArea.name,
        ticketPrice: selectedSeatingArea.price,
        quantity: quantity,
        totalAmount: calculateTotal(),
        purchaseTime: new Date().toISOString(), // 添加購買時間戳記錆跟蹤
      };

      sessionStorage.setItem("checkoutInfo", JSON.stringify(ticketInfo));
      console.log("已將購票信息存入sessionStorage:", ticketInfo);

      // 導航到結帳頁面
      navigate("/checkout");
    } else {
      // 如果未選擇座位區域，導航到演出場次票券頁面
      // 嘗試從 concert.performances 中獲取首個演出場次 ID
      if (concert.performances && concert.performances.length > 0) {
        const performanceId = concert.performances[0].id;
        navigate(`/tickets/performance/${performanceId}`);
      }
      // 如果沒有 performances 屬性或為空陣列，嘗試從票券陣列獲取演出場次 ID
      else if (concert.ticketAreas && concert.ticketAreas.length > 0) {
        // 檢查票券是否已關聯場次信息
        if (
          concert.ticketAreas[0].performance &&
          concert.ticketAreas[0].performance.id
        ) {
          // 從票券中取得場次ID
          const performanceId = concert.ticketAreas[0].performance.id;
          navigate(`/tickets/performance/${performanceId}`);
        } else {
          // 使用票券ID作為備選
          const ticketId = concert.ticketAreas[0].id;
          navigate(`/tickets/${ticketId}`);
        }
      }
      // 如果上述方法都失敗，則彈出提示
      else {
        alert("此音樂會暫無可用的演出場次");
      }
    }
  };

  if (loading) {
    return (
      <div
        id="loading-container"
        className="container mx-auto px-4 py-16 flex justify-center items-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">找不到音樂會</h1>
        <p className="text-gray-600 mb-8">
          抱歉，您要查詢的音樂會不存在或已被移除。
        </p>
        <Link
          to="/concerts"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
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
          <Link to="/" className="hover:text-indigo-600">
            首頁
          </Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-indigo-600">
            音樂會
          </Link>
          <span>/</span>
          <span className="text-gray-700">{concert?.title || "詳情"}</span>
        </div>
      </div>

      {/* 音樂會基本信息 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8">
        <div className="relative">
          {/* 使用真實圖片或佔位圖 */}
          {concert.image ? (
            <img
              src={concert.image}
              alt={concert.title}
              className="w-full h-96 object-cover object-center"
            />
          ) : (
            <SimplePlaceholder
              width="100%"
              height={384}
              text={concert.imageText || concert.title}
              className="w-full h-96 object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {concert.title}
              </h1>
              <div className="flex items-center mb-1">
                <User size={18} className="mr-2" />
                <span className="text-lg">{concert.performer}</span>
                <span className="mx-2">-</span>
                <span>{concert.performerTitle}</span>
              </div>
              <div className="flex flex-col space-y-1 mt-3">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    演出時間：{formatDate(concert.date)}{" "}
                    {formatTime(concert.date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>
                    地點：{concert.location} ({concert.address})
                  </span>
                </div>
                {concert.organizer && (
                  <div className="flex items-center">
                    <span className="mr-2">●</span>
                    <span>承辦單位：{concert.organizer}</span>
                  </div>
                )}
                {concert.organizerContact && (
                  <div className="flex items-center">
                    <span className="mr-2">●</span>
                    <span>聯絡電話：{concert.organizerContact}</span>
                  </div>
                )}
                {concert.organizerEmail && (
                  <div className="flex items-center">
                    <span className="mr-2">●</span>
                    <span>聯絡信箱：{concert.organizerEmail}</span>
                  </div>
                )}

                {/* 添加主「立即購票」按鈕 */}
                <div className="mt-4">
                  <button
                    onClick={handleBuyNow}
                    className="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 ease-in-out flex items-center shadow-lg hover:shadow-xl"
                  >
                    <Ticket size={22} className="mr-2" />
                    立即購票
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* 左側內容 */}
        <div className="lg:col-span-1">
          {/* 標籤頁導航 */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
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
                  className={`flex items-center pb-4 px-1 ${
                    activeTab === tab.id
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 標籤頁內容 */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            {activeTab === "tickets" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">購票資訊</h2>
                <div className="space-y-4">
                  {concert.ticketAreas.map((area) => (
                    <div
                      key={area.id}
                      onClick={() => handleSelectSeatingArea(area)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedSeatingArea?.id === area.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{area.name}</span>
                        <span className="text-indigo-600">
                          NT$ {area.price}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        剩餘座位：{area.available}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSeatingArea && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">購票數量</span>
                      <div className="flex items-center space-x-2">
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
                          disabled={quantity >= selectedSeatingArea.available}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">總計金額</span>
                      <span className="text-xl font-bold text-indigo-600">
                        NT$ {calculateTotal()}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                      >
                        加入購物車
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                      >
                        {selectedSeatingArea ? "立即購買" : "查看所有票種"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "description" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">音樂會介紹</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {concert.description}
                </p>
              </div>
            )}

            {activeTab === "program" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">節目單</h2>
                <div className="space-y-4">
                  {concert.program.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600">{item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "performer" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">表演者簡介</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {concert.performerBio}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">觀眾評論</h2>
                <div className="space-y-4">
                  {concert.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.user}</span>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 圖片庫 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">活動照片</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 使用內建佔位元件替代外部圖片 */}
          {concert.galleryItems &&
            concert.galleryItems.map((item, index) => (
              <div key={index} className="relative aspect-w-4 aspect-h-3 h-60">
                <SimplePlaceholder
                  width="100%"
                  height="100%"
                  text={item}
                  className="object-cover rounded-lg w-full h-full"
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ConcertDetailPage;
