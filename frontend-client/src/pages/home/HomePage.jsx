import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Play } from "lucide-react";
import concertService from "../../services/concertService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";
import ConcertHistory from "../../components/concert/ConcertHistory";
import { formatDate, formatTime } from "../../utils/dateUtils"; // 導入共享函數

const HomePage = () => {
  const [upcomingConcerts, setUpcomingConcerts] = useState([]);
  const [pastConcerts, setPastConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 檢查環境變量
    console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL || "未設置");
    console.log("目前網頁域名:", window.location.origin);
    
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        console.log("開始獲取音樂會數據…");

        // 從後端獲取所有活躍音樂會
        const activeConcerts = await concertService.getAllConcerts();
        console.log("音樂會數據回應:", activeConcerts);
        
        // 如果沒有數據，顯示空列表並提示用戶
        if (!activeConcerts || activeConcerts.length === 0) {
          console.warn('沒有音樂會數據可顯示');
          setUpcomingConcerts([]);
          setPastConcerts([]);
          setError('後端資料庫中無音樂會數據。請確保管理後台已經創建資料並正確寫入到 H2 資料庫。');
          setLoading(false);
          return;
        }

        // 將API返回的數據格式化為頁面需要的格式
        const formattedUpcomingConcerts = activeConcerts.map((concert) => {
          // 修改這裡：優先讀取 startTimes[0]，然後才是 performances 或 startTime
          const firstStartTimeFromArray = concert.startTimes?.[0];
          const firstPerformanceTime = concert.performances?.[0]?.startTime;
          const displayTime = firstStartTimeFromArray || concert.startTime || firstPerformanceTime || null;

          return {
            id: concert.id,
            title: concert.title || "未命名音樂會",
            // 假設 performer 在 concert 對象中，如果沒有則使用 artist 或預設值
            artist: concert.performer || concert.artist || "音樂會表演者",
            // 使用 dateUtils 格式化日期和時間
            date: displayTime ? formatDate(displayTime, 'zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : "日期未定",
            time: displayTime ? formatTime(displayTime, 'zh-TW', { hour: "2-digit", minute: "2-digit", hour12: false }) : "",
            image: concert.posterUrl || null,
            // 假設 venue 在 concert 或第一個 performance 對象中
            // 如果 venue 也在 venues 陣列中，可以這樣讀取：
            venue: concert.venues?.[0] || concert.venue || concert.performances?.[0]?.venue || "數位音樂廳",
            // 保留原始時間戳用於可能的排序或其他邏輯
            rawDate: displayTime,
            // performanceCount 似乎是直接提供的，如果沒有，再從 performances 算
            performanceCount: concert.performanceCount ?? concert.performances?.length ?? 0,
          };
        });

        // 根據 rawDate 排序即將上演的音樂會（可選）
        formattedUpcomingConcerts.sort((a, b) => {
          if (!a.rawDate) return 1;
          if (!b.rawDate) return -1;
          return new Date(a.rawDate) - new Date(b.rawDate);
        });

        // 嘗試獲取過往音樂會
        try {
          const pastConcertsData = await concertService.getPastConcerts();
          console.log("Past concerts:", pastConcertsData);

          const formattedPastConcerts = pastConcertsData.map((concert) => ({
            id: concert.id,
            title: concert.title || "未命名音樂會",
            artist: concert.artist || "音樂會表演者",
            date: concert.startTime
              ? new Date(concert.startTime).toLocaleDateString()
              : "N/A",
            image: concert.posterUrl || null,
          }));

          setPastConcerts(formattedPastConcerts);
        } catch (pastError) {
          console.error("Error fetching past concerts:", pastError);
          // 如果無法獲取過往音樂會，使用一部分未來音樂會作為預覽
          setPastConcerts(formattedUpcomingConcerts.slice(0, 2));
        }

        setUpcomingConcerts(formattedUpcomingConcerts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching concerts:", err);
        // 顯示更詳細的錯誤信息
        const errorMsg = err.response ? 
          `錯誤代碼: ${err.response.status} - ${err.response.statusText}` : 
          `網絡錯誤: ${err.message}`;
          
        console.error('後端要求詳細錯誤:', errorMsg);
        console.error('後端 URL:', process.env.REACT_APP_API_URL || "http://localhost:8080");
        
        setError(`無法載入音樂會數據 - ${errorMsg}\n請確認後端服務器在端口 8080 運行。`);
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <p className="text-xl text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 主要特色音樂會 */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="py-12 px-8 text-center text-white">
            <h1 className="text-2xl font-bold mb-2">
              {upcomingConcerts.length > 0
                ? upcomingConcerts[0].title
                : "來一場數位音樂之旅"}
            </h1>
            <p className="text-lg mb-1">
              {upcomingConcerts.length > 0
                ? upcomingConcerts[0].artist
                : "享受線上音樂廳的獨特體驗"}
            </p>
            <p className="text-base mb-6">
              {upcomingConcerts.length > 0
                // 顯示格式化後的日期和時間
                ? `${upcomingConcerts[0].date} ${upcomingConcerts[0].time}`
                : "隨時隨地，在家欣賞美妙音樂"}
              {/* 顯示多場次提示 */}
              {upcomingConcerts.length > 0 && upcomingConcerts[0].performanceCount > 1 && (
                <span className="ml-2 text-xs text-indigo-300">(多場次)</span>
              )}
            </p>
            <Link
              to={
                upcomingConcerts.length > 0
                  ? `/concerts/${upcomingConcerts[0].id}`
                  : "/concerts"
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-10 rounded inline-block"
            >
              {upcomingConcerts.length > 0 ? "立即購票" : "探索音樂會"}
            </Link>
          </div>
        </div>
      </div>

      {/* 即將上演的音樂會 */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">即將上演的音樂會</h2>
            <Link
              to="/concerts"
              className="text-indigo-700 hover:text-indigo-800 text-sm"
            >
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 只顯示前 3 場 */}
            {upcomingConcerts.slice(0, 3).map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
              >
                {concert.image ? (
                  <img
                    src={concert.image}
                    alt={concert.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <SimplePlaceholder
                    width="100%"
                    height={160}
                    text={concert.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{concert.title}</h3>
                  <p className="text-gray-600 text-sm">{concert.artist}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                    <Calendar size={14} className="mr-1" />
                    {/* 顯示格式化後的日期和時間 */}
                    {concert.date} {concert.time}
                    {/* 顯示多場次提示 */}
                    {concert.performanceCount > 1 && (
                       <span className="ml-1 text-xs text-indigo-600">(多場次)</span>
                    )}
                  </div>
                  <Link
                    to={`/concerts/${concert.id}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-center inline-block"
                  >
                    立即購票
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 瀏覽歷史 */}
      <ConcertHistory className="max-w-6xl mx-auto px-4 py-8" />

      {/* 過往演出精選 */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">精選回放</h2>
            <Link
              to="/recordings"
              className="text-indigo-700 hover:text-indigo-800 text-sm"
            >
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastConcerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
              >
                <div className="relative">
                  {concert.image ? (
                    <img
                      src={concert.image}
                      alt={concert.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <SimplePlaceholder
                      width="100%"
                      height={160}
                      text={concert.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-600 rounded-full p-2 opacity-80">
                      <Play size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{concert.title}</h3>
                  <p className="text-gray-600 text-sm">{concert.artist}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                    <Calendar size={14} className="mr-1" />
                    {concert.date}
                  </div>
                  <Link
                    to={`/recording/${concert.id}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-center inline-block"
                  >
                    購票觀看
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
