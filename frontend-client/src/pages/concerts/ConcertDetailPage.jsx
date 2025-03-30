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
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";

const ConcertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeatingArea, setSelectedSeatingArea] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tickets");

  // 從後端獲取音樂會詳情
  useEffect(() => {
    const fetchConcertDetails = async () => {
      try {
        setLoading(true);
        // 使用開發的服務獲取音樂會詳情
        const concertData = await concertService.getConcertById(id);
        
        // 將API回傳的資料轉換為頁面需要的格式
        const concertDetails = {
          id: concertData.id,
          title: concertData.title,
          performer: "表演者",  // 預設得表演者
          performerTitle: "音樂家",  // 預設的順位
          date: concertData.performances && concertData.performances[0] ? concertData.performances[0].startTime : new Date().toISOString(),
          location: concertData.performances && concertData.performances[0] ? concertData.performances[0].venue : "數位音樂廳",
          address: "台北市中正區忠孝東路一段123號",  // 預設的地址
          // 使用實際圖片或null (將使用本地渲染的佔位圖片)
          image: concertData.posterUrl || null,
          imageText: concertData.title,  // 用於渲染佔位圖
          description: concertData.description || "暫無活動說明",
          organizer: "數位音樂廳組委會",  // 預設主辦單位
          organizerContact: "02-1234-5678",  // 預設聯絡電話
          organizerEmail: "contact@digitalconcerthall.example.com",  // 預設電子郵件
          performerBio: concertData.description || "暫無表演者資料",
          
          // 節目單，從程式細節中解析或使用預設值
          program: concertData.programDetails ? 
            concertData.programDetails.split('\n')
              .filter(line => line.trim().length > 0)
              .map((line, index) => ({
                name: line.trim(),
                duration: "15分鐘"
              })) : 
            [
              { name: "第一樹場曲目", duration: "15分鐘" },
              { name: "第二樹場曲目", duration: "20分鐘" }
            ],
          
          // 如果有多個演出場次，將其轉換為票券區域
          ticketAreas: concertData.performances ? 
            concertData.performances.map((perf, index) => ({
              id: perf.id,
              name: `${formatDate(perf.startTime)} ${formatTime(perf.startTime)} ${perf.venue || "數位音樂廳"}`,
              price: 500 + (index * 100),  // 模擬不同場次的價格
              available: 50 - (index * 5)  // 模擬剩餘票數
            })) : 
            [
              { id: 1, name: "普通座位", price: 500, available: 50 },
              { id: 2, name: "VIP座位", price: 1000, available: 20 }
            ],
          
          // 評論和圖片庫使用預設值
          reviews: [
            { id: 1, user: "觀眾1", rating: 5, comment: "非常精彩的演出！" },
            { id: 2, user: "觀眾2", rating: 4, comment: "好聽的音樂，但場地有點小。" }
          ],
          // 使用名稱字串陣列來替代URL，會用佔位圖組件渲染
          galleryItems: [
            "Gallery 1",
            "Gallery 2",
            "Gallery 3"
          ]
        };
        
        setConcert(concertDetails);
      } catch (error) {
        console.error('Error fetching concert details:', error);
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
  
  console.log('購物車 - 用戶登入狀態:', {
  user: currentUser ? currentUser.username : '未登入', 
    tokenValid: isTokenValid ? '有效' : '無效或過期'
  });

  // 檢查用戶是否已登入並且令牌有效
  if (!currentUser || !isTokenValid) {
    // 如果用戶未登入或令牌無效，導向登入頁面
    console.log('用戶未登入或令牌無效，重定向到登入頁面');
    alert('請先登入才能將商品加入購物車');
    
    // 先清除已經失效的登入狀態
    if (!isTokenValid && currentUser) {
      authService.logout();
    }
    
    navigate('/auth/login?redirect=' + encodeURIComponent(`/concerts/${id}`));
    return;
  }

    // 創建商品物件用於添加到購物車
    const cartItem = {
      id: concert.id,
      type: 'concert',
      name: `${concert.title} - ${selectedSeatingArea.name}`,
      price: selectedSeatingArea.price,
      quantity: quantity,
      date: concert.date
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
  if (!selectedSeatingArea) return;

  // 清楚檢查用戶登入狀態
  const currentUser = authService.getCurrentUser();
  const isTokenValid = authService.isTokenValid();
  
  console.log('票券頁面 - 用戶登入狀態:', {
  user: currentUser ? currentUser.username : '未登入', 
    tokenValid: isTokenValid ? '有效' : '無效或過期'
  });

  // 檢查用戶是否已登入並且令牌有效
  if (!currentUser || !isTokenValid) {
  // 如果用戶未登入或令牌無效，導向登入頁面
  console.log('用戶未登入或令牌無效，重定向到登入頁面');
  alert('請先登入才能進行購票');
  
  // 先清除已經失效的登入狀態
    if (!isTokenValid && currentUser) {
      authService.logout();
    }
    
    navigate('/auth/login?redirect=' + encodeURIComponent(`/concerts/${id}`));
    return;
  }

  // 將購票信息存入 sessionStorage，以便結帳頁面可以使用
  const ticketInfo = {
    concertId: concert.id,
    concertTitle: concert.title,
    ticketType: selectedSeatingArea.name,
    ticketPrice: selectedSeatingArea.price,
    quantity: quantity,
    totalAmount: calculateTotal(),
    purchaseTime: new Date().toISOString() // 添加購買時間戳記錆跟蹤
  };

  sessionStorage.setItem("checkoutInfo", JSON.stringify(ticketInfo));
  console.log('已將購票信息存入sessionStorage:', ticketInfo);

  // 導航到結帳頁面
  navigate("/checkout");
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
          <Link to="/concerts" className="hover:text-indigo-600">
            音樂會
          </Link>
          <span>/</span>
          <span className="text-gray-700">{concert.title}</span>
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
                        立即購買
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
          {concert.galleryItems && concert.galleryItems.map((item, index) => (
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