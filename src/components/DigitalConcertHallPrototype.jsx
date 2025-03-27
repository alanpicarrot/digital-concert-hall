import React, { useState } from "react";
import {
  Music,
  Calendar,
  User,
  ShoppingCart,
  Play,
  Search,
  Menu,
  X,
} from "lucide-react";

const DigitalConcertHallPrototype = () => {
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 模擬數據
  const upcomingConcerts = [
    {
      id: 1,
      title: "貝多芬第九號交響曲",
      artist: "臺北交響樂團",
      date: "2025/04/15",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      title: "莫札特鋼琴協奏曲",
      artist: "鋼琴家王小明與臺北交響樂團",
      date: "2025/04/22",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      title: "巴赫無伴奏大提琴組曲",
      artist: "大提琴家李大華",
      date: "2025/05/01",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
  ];

  const pastConcerts = [
    {
      id: 4,
      title: "蕭邦夜曲集",
      artist: "鋼琴家陳美麗",
      date: "2025/03/10",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      title: "德布西印象集",
      artist: "鋼琴家張小剛",
      date: "2025/02/20",
      time: "19:30",
      image: "/api/placeholder/300/200",
    },
  ];

  // 渲染標題區
  const renderHeader = () => (
    <header className="bg-indigo-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">數位音樂廳</h1>
        <div className="hidden md:flex space-x-4">
          <button
            className={`px-3 py-2 rounded ${
              activePage === "home" ? "bg-indigo-700" : ""
            }`}
            onClick={() => setActivePage("home")}
          >
            首頁
          </button>
          <button
            className={`px-3 py-2 rounded ${
              activePage === "concerts" ? "bg-indigo-700" : ""
            }`}
            onClick={() => setActivePage("concerts")}
          >
            音樂會
          </button>
          <button
            className={`px-3 py-2 rounded ${
              activePage === "artists" ? "bg-indigo-700" : ""
            }`}
            onClick={() => setActivePage("artists")}
          >
            藝術家
          </button>
          <button
            className={`px-3 py-2 rounded ${
              activePage === "livestream" ? "bg-indigo-700" : ""
            }`}
            onClick={() => setActivePage("livestream")}
          >
            直播
          </button>
          <button className="px-3 py-2">
            <ShoppingCart className="inline" size={20} />
          </button>
          <button className="px-3 py-2">
            <User className="inline" size={20} />
          </button>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 行動裝置選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4">
          <nav className="flex flex-col space-y-2">
            <button
              className={`px-3 py-2 rounded text-left ${
                activePage === "home" ? "bg-indigo-700" : ""
              }`}
              onClick={() => {
                setActivePage("home");
                setMobileMenuOpen(false);
              }}
            >
              首頁
            </button>
            <button
              className={`px-3 py-2 rounded text-left ${
                activePage === "concerts" ? "bg-indigo-700" : ""
              }`}
              onClick={() => {
                setActivePage("concerts");
                setMobileMenuOpen(false);
              }}
            >
              音樂會
            </button>
            <button
              className={`px-3 py-2 rounded text-left ${
                activePage === "artists" ? "bg-indigo-700" : ""
              }`}
              onClick={() => {
                setActivePage("artists");
                setMobileMenuOpen(false);
              }}
            >
              藝術家
            </button>
            <button
              className={`px-3 py-2 rounded text-left ${
                activePage === "livestream" ? "bg-indigo-700" : ""
              }`}
              onClick={() => {
                setActivePage("livestream");
                setMobileMenuOpen(false);
              }}
            >
              直播
            </button>
            <div className="flex space-x-4 pt-2">
              <button className="px-3 py-2">
                <ShoppingCart className="inline mr-2" size={20} /> 購物車
              </button>
              <button className="px-3 py-2">
                <User className="inline mr-2" size={20} /> 會員
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );

  // 主頁
  const HomePage = () => (
    <div className="container mx-auto px-4 py-8">
      {/* 輪播橫幅 */}
      <div className="relative rounded-lg overflow-hidden mb-8 bg-gray-800 h-64 flex items-center justify-center">
        <img
          src="/api/placeholder/1200/400"
          alt="Featured concert"
          className="w-full h-full object-cover absolute opacity-50"
        />
        <div className="z-10 text-center text-white p-4">
          <h2 className="text-3xl font-bold mb-2">貝多芬第九號交響曲</h2>
          <p className="text-xl mb-4">臺北交響樂團</p>
          <p className="text-lg mb-6">2025年4月15日 19:30</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full">
            立即購票
          </button>
        </div>
      </div>

      {/* 即將上演的音樂會 */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">即將上演的音樂會</h2>
          <button
            className="text-indigo-600 hover:text-indigo-800"
            onClick={() => setActivePage("concerts")}
          >
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingConcerts.map((concert) => (
            <div
              key={concert.id}
              className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
            >
              <img
                src={concert.image}
                alt={concert.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
                <p className="text-gray-600 mb-2">{concert.artist}</p>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar size={16} className="mr-1" />
                  {concert.date} {concert.time}
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
                  立即購票
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 精選回放 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">精選回放</h2>
          <button className="text-indigo-600 hover:text-indigo-800">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastConcerts.map((concert) => (
            <div
              key={concert.id}
              className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={concert.image}
                  alt={concert.title}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play size={24} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
                <p className="text-gray-600 mb-2">{concert.artist}</p>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar size={16} className="mr-1" />
                  {concert.date}
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
                  購票觀看
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // 音樂會列表頁
  const ConcertsPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">音樂會列表</h1>

      {/* 搜尋和篩選 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="搜尋音樂會、藝術家..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex space-x-4">
            <select className="border rounded-lg px-4 py-2">
              <option>所有時段</option>
              <option>本週</option>
              <option>本月</option>
              <option>未來三個月</option>
            </select>
            <select className="border rounded-lg px-4 py-2">
              <option>所有曲目</option>
              <option>交響曲</option>
              <option>協奏曲</option>
              <option>室內樂</option>
            </select>
            <select className="border rounded-lg px-4 py-2">
              <option>所有藝術家</option>
              <option>指揮</option>
              <option>鋼琴</option>
              <option>小提琴</option>
            </select>
          </div>
        </div>
      </div>

      {/* 音樂會列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...upcomingConcerts, ...pastConcerts].map((concert) => (
          <div
            key={concert.id}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
          >
            <img
              src={concert.image}
              alt={concert.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
              <p className="text-gray-600 mb-2">{concert.artist}</p>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar size={16} className="mr-1" />
                {concert.date} {concert.time}
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
                立即購票
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 音樂會詳情頁
  const ConcertDetailPage = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          className="text-indigo-600 hover:underline"
          onClick={() => setActivePage("concerts")}
        >
          &larr; 返回音樂會列表
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <img
          src="/api/placeholder/1200/400"
          alt="Concert"
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">貝多芬第九號交響曲</h1>
          <p className="text-xl text-gray-600 mb-4">臺北交響樂團</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <Calendar size={16} className="inline mr-2" />
              2025年4月15日 19:30
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
              貝多芬第九號交響曲，又稱「合唱」，是貝多芬最後一部完整的交響曲，也是他最著名的作品之一。
              這部作品在音樂史上具有劃時代的意義，其中最著名的「歡樂頌」旋律已成為歐盟的官方頌歌。
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
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg text-lg font-semibold">
              立即購票
            </button>
            <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-lg text-lg font-semibold">
              下載音樂會小冊子
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">票券資訊</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <h3 className="font-bold text-lg">VIP票</h3>
              <p className="text-gray-600">最佳視聽位置，含精美節目冊</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">NT$ 2,000</p>
              <div className="flex items-center mt-2">
                <button className="border rounded-l px-3 py-1">-</button>
                <input
                  type="text"
                  value="0"
                  className="w-12 text-center border-t border-b py-1"
                />
                <button className="border rounded-r px-3 py-1">+</button>
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
                <button className="border rounded-l px-3 py-1">-</button>
                <input
                  type="text"
                  value="0"
                  className="w-12 text-center border-t border-b py-1"
                />
                <button className="border rounded-r px-3 py-1">+</button>
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
                <button className="border rounded-l px-3 py-1">-</button>
                <input
                  type="text"
                  value="0"
                  className="w-12 text-center border-t border-b py-1"
                />
                <button className="border rounded-r px-3 py-1">+</button>
              </div>
            </div>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg text-lg font-semibold mt-4">
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );

  // 直播/點播觀看頁
  const LivestreamPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">音樂會直播</h1>

      <div className="bg-black rounded-lg overflow-hidden mb-6">
        <div className="aspect-w-16 aspect-h-9 w-full h-96 flex items-center justify-center bg-gray-800">
          <div className="text-white flex flex-col items-center">
            <Play size={64} />
            <p className="mt-4 text-xl">點擊開始觀看直播</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">蕭邦夜曲集</h2>
        <p className="text-gray-600 mb-4">鋼琴家陳美麗</p>
        <p className="mb-4">
          蕭邦的夜曲系列是鋼琴音樂中最著名、最受喜愛的作品之一，陳美麗鋼琴家將為您呈現精選的蕭邦夜曲，展現蕭邦音樂的抒情性與深度。
        </p>

        <div className="flex space-x-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
            全屏觀看
          </button>
          <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded">
            下載音樂會資料
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">觀眾互動</h2>
        <div className="border rounded-lg p-4 h-64 mb-4 overflow-y-auto">
          <div className="mb-3">
            <p className="font-bold">音樂愛好者:</p>
            <p className="pl-3">
              陳老師的詮釋非常細膩，尤其是Op.9 No.2的處理太美了！
            </p>
          </div>
          <div className="mb-3">
            <p className="font-bold">小提琴手:</p>
            <p className="pl-3">請問這架鋼琴是史坦威嗎？音色非常棒</p>
          </div>
          <div className="mb-3">
            <p className="font-bold">系統消息:</p>
            <p className="pl-3">下一首將演奏蕭邦夜曲Op.48 No.1</p>
          </div>
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="發送訊息..."
            className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-r-lg">
            發送
          </button>
        </div>
      </div>
    </div>
  );

  // 頁面渲染判斷
  const renderContent = () => {
    switch (activePage) {
      case "home":
        return <HomePage />;
      case "concerts":
        return <ConcertsPage />;
      case "concert-detail":
        return <ConcertDetailPage />;
      case "livestream":
        return <LivestreamPage />;
      default:
        return <HomePage />;
    }
  };

  // 底部資訊
  const renderFooter = () => (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">數位音樂廳</h3>
            <p className="text-gray-400">
              為您提供優質的線上音樂欣賞體驗，隨時隨地享受頂級音樂會。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">關於我們</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  關於數位音樂廳
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  合作藝術家
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  徵才資訊
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">幫助中心</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  常見問題
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  購票說明
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  觀看指南
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  退款政策
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">訂閱電子報</h3>
            <p className="text-gray-400 mb-2">獲取最新音樂會資訊和優惠</p>
            <div className="flex">
              <input
                type="email"
                placeholder="您的電子郵件"
                className="px-4 py-2 rounded-l text-black w-full"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r">
                訂閱
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 數位音樂廳. 版權所有.</p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {renderHeader()}
      <main className="flex-grow">{renderContent()}</main>
      {renderFooter()}
    </div>
  );
};

export default DigitalConcertHallPrototype;
