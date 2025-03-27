import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Calendar, Clock, Volume2, MessageSquare, Share2, Download, ThumbsUp, Send, ShoppingCart } from "lucide-react";
import cartService from "../services/cartService";

const LivestreamPage = ({ livestreams }) => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [volume, setVolume] = useState(80);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  
  // 查找當前的直播
  const stream = livestreams?.find(s => s.id.toString() === id) || 
                (livestreams && livestreams[0]) || 
                {
                  id: 1,
                  title: "週末古典音樂直播",
                  description: "每週日晚間的古典音樂現場直播，由臺北交響樂團演奏經典作品。",
                  date: "2025/04/20",
                  time: "19:00",
                  image: "/api/placeholder/300/200",
                  status: "upcoming"
                };

  // 模擬聊天訊息
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "音樂愛好者", message: "期待今天的演出，上次太精彩了！", time: "18:55" },
    { id: 2, user: "小提琴手", message: "這首莫札特的作品詮釋得太美了", time: "19:02" },
    { id: 3, user: "系統消息", message: "歡迎來到直播間，請文明留言互動", time: "19:05" }
  ]);

  // 發送訊息
  const sendMessage = () => {
    if (message.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          user: "您",
          message: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setMessage("");
    }
  };

  // 處理按鍵事件，按Enter發送訊息
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/livestreams"
          className="text-indigo-600 hover:underline"
        >
          &larr; 返回直播列表
        </Link>
      </div>

      {/* 直播標題 */}
      <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>
      <p className="text-gray-600 mb-6">{stream.description}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左側：直播視頻 */}
        <div className="lg:w-3/4">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <div className="aspect-w-16 aspect-h-9 w-full h-96 flex items-center justify-center bg-gray-800">
              <div className="text-white flex flex-col items-center">
                <Play size={64} />
                <p className="mt-4 text-xl">
                  {stream.status === "upcoming" ? "直播尚未開始" : "點擊開始觀看"}
                </p>
              </div>
            </div>
          </div>
          
          {/* 控制條 */}
          <div className="bg-gray-900 text-white p-4 rounded-b-lg mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Play size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <Volume2 size={18} />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Share2 size={18} />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Download size={18} />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full" onClick={() => setIsChatExpanded(!isChatExpanded)}>
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
          
          {/* 信息區 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{stream.title}</h2>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                  <ThumbsUp size={16} />
                  <span>讚好</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                  <Share2 size={16} />
                  <span>分享</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center">
                <Calendar size={16} className="mr-2" />
                {stream.date} {stream.time}
              </div>
              {stream.duration && (
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center">
                  <Clock size={16} className="mr-2" />
                  時長: {stream.duration}
                </div>
              )}
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                {stream.status === "upcoming" ? "即將直播" : "可觀看"}
              </div>
            </div>
            <p className="text-gray-700">
              {stream.description}
            </p>
            
            {stream.status === "upcoming" && (
              <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">購買直播票券</h3>
                <p className="mb-3">該直播將於 {stream.date} {stream.time} 開始，立即購買票券以觀看直播。</p>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold">標準票價</h4>
                    <p className="text-2xl font-bold mb-2">NT$ 350</p>
                    <p className="text-gray-600 text-sm">可即時觀看及回放30天</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center px-4 py-2 rounded"
                      onClick={() => {
                        cartService.addToCart({
                          id: `stream-${stream.id}`,
                          name: `${stream.title} - 直播票券`,
                          price: 350,
                          quantity: 1,
                          type: 'livestream',
                          image: stream.image,
                          date: stream.date
                        });
                        
                        setAddedToCart(true);
                        setTimeout(() => {
                          setAddedToCart(false);
                        }, 3000);
                      }}
                    >
                      <ShoppingCart className="mr-2" size={18} /> 加入購物車
                    </button>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        cartService.addToCart({
                          id: `stream-${stream.id}`,
                          name: `${stream.title} - 直播票券`,
                          price: 350,
                          quantity: 1,
                          type: 'livestream',
                          image: stream.image,
                          date: stream.date
                        });
                        navigate('/cart');
                      }}
                    >
                      立即購買
                    </button>
                  </div>
                </div>
                {addedToCart && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                    已成功加入購物車！ <Link to="/cart" className="font-semibold underline">前往查看</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 右側：聊天區 */}
        {isChatExpanded && (
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                <span>觀眾互動</span>
                <button 
                  className="text-gray-500 hover:text-gray-700 lg:hidden"
                  onClick={() => setIsChatExpanded(false)}
                >
                  &times;
                </button>
              </h2>
              <div className="border rounded-lg p-4 h-96 mb-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    <div className="flex justify-between">
                      <p className="font-bold">{msg.user}:</p>
                      <span className="text-xs text-gray-500">{msg.time}</span>
                    </div>
                    <p className="pl-3">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="發送訊息..."
                  className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg flex items-center"
                  onClick={sendMessage}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 推薦其他直播 */}
      {livestreams && livestreams.length > 1 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">其他推薦直播</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {livestreams
              .filter(s => s.id !== parseInt(id))
              .slice(0, 3)
              .map(s => (
                <div key={s.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative">
                    <img src={s.image} alt={s.title} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {s.status === "upcoming" ? "即將直播" : "可觀看"}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{s.date} {s.time}</p>
                    <Link 
                      to={`/livestream/${s.id}`} 
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      了解更多 &rarr;
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestreamPage;
