import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Calendar, ShoppingCart } from "lucide-react";
import cartService from "../services/cartService";

const ConcertDetailPage = ({ upcomingConcerts, pastConcerts }) => {
  const { id } = useParams();
  
  // 合併所有音樂會資料並查找當前的音樂會
  const allConcerts = [...upcomingConcerts, ...pastConcerts];
  const concert = allConcerts.find(c => c.id.toString() === id) || {
    id: 1,
    title: "貝多芬第九號交響曲",
    artist: "臺北交響樂團",
    date: "2025/04/15",
    time: "19:30",
    image: "/api/placeholder/1200/400"
  };
  
  const [ticketCounts, setTicketCounts] = useState({
    vip: 0,
    normal: 0,
    student: 0
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const [showEmptyCartToast, setShowEmptyCartToast] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/concerts"
          className="text-indigo-600 hover:underline"
        >
          &larr; 返回音樂會列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <img
          src={concert.image.replace("300/200", "1200/400")}
          alt={concert.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{concert.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{concert.artist}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <Calendar size={16} className="inline mr-2" />
              {concert.date} {concert.time}
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              地點: 國家音樂廳
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              時長: 約120分鐘
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">音樂會介紹</h2>
            <p className="text-gray-700 mb-4">
              {concert.title}是一部經典名作，將由{concert.artist}為您呈現。
              這部作品在音樂史上具有劃時代的意義，歡迎您蒞臨欣賞。
            </p>
            <p className="text-gray-700">
              本場音樂會由著名指揮家張大師領銜，與臺北交響樂團、合唱團共同演出這部不朽的經典。
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">曲目</h2>
            <ul className="list-disc pl-5 text-gray-700">
              <li className="mb-2">
                第一樂章: 稍快的快板 (Allegro ma non troppo, un poco maestoso)
              </li>
              <li className="mb-2">第二樂章: 很快的快板 (Molto vivace)</li>
              <li className="mb-2">
                第三樂章: 柔板 (Adagio molto e cantabile)
              </li>
              <li>第四樂章: 終曲 (Finale)</li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-lg text-lg font-semibold">
              下載音樂會小冊子
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">購買票券</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">VIP票</h3>
              <p className="text-gray-600">最佳視聽位置，含精美節目冊</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">NT$ 2,000</p>
              <div className="flex items-center mt-2">
                <button 
                  className="border rounded-l px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, vip: Math.max(0, ticketCounts.vip - 1)});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={ticketCounts.vip}
                  className="w-12 text-center border-t border-b py-1"
                  readOnly
                />
                <button 
                  className="border rounded-r px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, vip: ticketCounts.vip + 1});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">一般票</h3>
              <p className="text-gray-600">標準座位</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">NT$ 1,200</p>
              <div className="flex items-center mt-2">
                <button 
                  className="border rounded-l px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, normal: Math.max(0, ticketCounts.normal - 1)});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={ticketCounts.normal}
                  className="w-12 text-center border-t border-b py-1"
                  readOnly
                />
                <button 
                  className="border rounded-r px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, normal: ticketCounts.normal + 1});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">學生票</h3>
              <p className="text-gray-600">需出示有效學生證</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">NT$ 800</p>
              <div className="flex items-center mt-2">
                <button 
                  className="border rounded-l px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, student: Math.max(0, ticketCounts.student - 1)});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  -
                </button>
                <input
                  type="text"
                  value={ticketCounts.student}
                  className="w-12 text-center border-t border-b py-1"
                  readOnly
                />
                <button 
                  className="border rounded-r px-3 py-1"
                  onClick={() => {
                    setTicketCounts({...ticketCounts, student: ticketCounts.student + 1});
                    setShowEmptyCartToast(false); // 點擊後關閉提示
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xl font-semibold mb-2">
              總金額: NT$ {(ticketCounts.vip * 2000) + (ticketCounts.normal * 1200) + (ticketCounts.student * 800)}
            </p>
          </div>
          
          <div className="flex gap-4 mt-4">
            <button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center"
              onClick={() => {
                // 判斷是否有選擇票券
                if (ticketCounts.vip > 0 || ticketCounts.normal > 0 || ticketCounts.student > 0) {
                  // 添加VIP票
                  if (ticketCounts.vip > 0) {
                    cartService.addToCart({
                      id: `${concert.id}-vip`,
                      name: `${concert.title} - VIP票`,
                      price: 2000,
                      quantity: ticketCounts.vip,
                      type: 'concert',
                      image: concert.image,
                      date: concert.date
                    });
                  }
                  
                  // 添加一般票
                  if (ticketCounts.normal > 0) {
                    cartService.addToCart({
                      id: `${concert.id}-normal`,
                      name: `${concert.title} - 一般票`,
                      price: 1200,
                      quantity: ticketCounts.normal,
                      type: 'concert',
                      image: concert.image,
                      date: concert.date
                    });
                  }
                  
                  // 添加學生票
                  if (ticketCounts.student > 0) {
                    cartService.addToCart({
                      id: `${concert.id}-student`,
                      name: `${concert.title} - 學生票`,
                      price: 800,
                      quantity: ticketCounts.student,
                      type: 'concert',
                      image: concert.image,
                      date: concert.date
                    });
                  }
                  
                  // 顯示成功提示並清空票券數量
                  setAddedToCart(true);
                  setTimeout(() => {
                    setAddedToCart(false);
                  }, 3000);
                  
                  // 重置票券數量
                  setTicketCounts({ vip: 0, normal: 0, student: 0 });
                } else {
                  // 顯示票券為空的提示
                  setShowEmptyCartToast(true);
                  // 不再使用計時器來自動關閉提示
                }
              }}
            >
              <ShoppingCart className="mr-2" /> 加入購物車
            </button>
            
            {ticketCounts.vip > 0 || ticketCounts.normal > 0 || ticketCounts.student > 0 ? (
              <button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold"
                onClick={() => {
                  // 檢查是否選擇了票券
                  if (ticketCounts.vip > 0 || ticketCounts.normal > 0 || ticketCounts.student > 0) {
                    // 添加到購物車並直接前往結帳
                    if (ticketCounts.vip > 0) {
                      cartService.addToCart({
                        id: `${concert.id}-vip`,
                        name: `${concert.title} - VIP票`,
                        price: 2000,
                        quantity: ticketCounts.vip,
                        type: 'concert',
                        image: concert.image,
                        date: concert.date
                      });
                    }
                    
                    if (ticketCounts.normal > 0) {
                      cartService.addToCart({
                        id: `${concert.id}-normal`,
                        name: `${concert.title} - 一般票`,
                        price: 1200,
                        quantity: ticketCounts.normal,
                        type: 'concert',
                        image: concert.image,
                        date: concert.date
                      });
                    }
                    
                    if (ticketCounts.student > 0) {
                      cartService.addToCart({
                        id: `${concert.id}-student`,
                        name: `${concert.title} - 學生票`,
                        price: 800,
                        quantity: ticketCounts.student,
                        type: 'concert',
                        image: concert.image,
                        date: concert.date
                      });
                    }
                    
                    // 導航到購物車頁面
                    navigate('/cart');
                  } else {
                    // 顯示票券為空的提示
                    setShowEmptyCartToast(true);
                    // 不再使用計時器來自動關閉提示
                  }
                }}
              >
                立即購買
              </button>
            ) : null}
          </div>
          
          {addedToCart && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
              已成功加入購物車！ <Link to="/cart" className="font-semibold underline">前往查看</Link>
            </div>
          )}
          
          {showEmptyCartToast && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
              請選擇票券數量
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConcertDetailPage;
