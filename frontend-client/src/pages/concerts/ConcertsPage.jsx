import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Music, Filter, Tag } from "lucide-react"; // Import Tag icon
import concertService from "../../services/concertService";
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";
import { formatDate } from "../../utils/dateUtils"; // 導入共享函數

const ConcertsPage = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    timeframe: "all",
    artist: "",
    genre: "",
  });

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("正在獲取音樂會數據...");

        // 根據時間範圍過濾獲取音樂會
        let concertsData;
        if (filters.timeframe === "past") {
          concertsData = await concertService.getPastConcerts();
        } else if (filters.timeframe === "upcoming") {
          concertsData = await concertService.getUpcomingConcerts();
        } else {
          concertsData = await concertService.getAllConcerts();
        }

        console.log("獲取的音樂會數據:", concertsData);

        // 檢查是否沒有數據
        if (!concertsData || concertsData.length === 0) {
          console.warn("後端返回空數據集");
          setConcerts([]);
          setError(
            "目前沒有音樂會數據。請確保管理後台已創建資料並正確寫入 H2 資料庫。"
          );
          setLoading(false);
          return;
        }

        // 格式化數據用於顯示
        // Remove mock price data
        const formattedConcerts = concertsData.map((concert) => ({
          id: concert.id,
          title: concert.title,
          performer: concert.performer || "表演者", // Keep fallback for performer if needed
          // Use concert's main startTime, fallback to first performance's time, then current time
          date:
            concert.startTime ||
            concert.performances?.[0]?.startTime ||
            new Date().toISOString(),
          posterUrl: concert.posterUrl,
          location: concert.venue || "數位音樂廳主廳", // Keep fallback for location if needed
          genre: concert.genre || "古典音樂", // Keep fallback for genre if needed
          // price: { min: 300, max: 1200 }, // REMOVE mock price
          description: concert.description,
          // Store the full performances array if available
          performances: concert.performances || [],
          // Keep performanceId for potential linking, maybe link to the first one?
          performanceId: concert.performances?.[0]?.id,
        }));

        console.log("格式化後的音樂會數據:", formattedConcerts.length);
        setConcerts(formattedConcerts);
      } catch (error) {
        console.error("獲取音樂會數據失敗:", error);
        setError(
          "無法載入音樂會資料。請確認後端服務運行正常，並且資料已正確寫入資料庫。"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [filters.timeframe]);

  // 顯示錯誤信息
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-red-600 text-lg">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 根據過濾條件過濾音樂會
  const filteredConcerts = concerts.filter((concert) => {
    const now = new Date();
    const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00

    // Get all valid performance dates for the concert
    const performanceDates = (concert.performances || [])
      .map((p) => new Date(p.startTime))
      .filter((d) => !isNaN(d.getTime())); // Filter out invalid dates

    // If no valid performance dates, use the main concert date
    if (performanceDates.length === 0) {
      const concertDate = new Date(concert.date);
      if (isNaN(concertDate.getTime())) {
        console.error(
          "無效的主要音樂會日期:",
          concert.date,
          "音樂會ID:",
          concert.id
        );
        // Decide how to handle concerts with no valid dates at all
        return filters.timeframe === "all"; // Only show in 'all' if no dates are valid
      }
      performanceDates.push(concertDate); // Use the main date if no performances array
    }

    // 「即將上演」過濾邏輯: Show if ANY performance is today or later
    if (filters.timeframe === "upcoming") {
      const isUpcoming = performanceDates.some((perfDate) => {
        const perfYMD = new Date(
          perfDate.getFullYear(),
          perfDate.getMonth(),
          perfDate.getDate()
        );
        return perfYMD >= nowYMD;
      });
      if (!isUpcoming) return false;
    }

    // 「過去演出」過濾邏輯: Show if ALL performances are before today
    if (filters.timeframe === "past") {
      const isPast = performanceDates.every((perfDate) => {
        const perfYMD = new Date(
          perfDate.getFullYear(),
          perfDate.getMonth(),
          perfDate.getDate()
        );
        return perfYMD < nowYMD;
      });
      if (!isPast) return false;
    }

    // 藝術家過濾 (保持不變)
    if (
      filters.artist &&
      !concert.performer.toLowerCase().includes(filters.artist.toLowerCase())
    ) {
      return false;
    }

    // 類型過濾 (保持不變)
    if (filters.genre && concert.genre !== filters.genre) {
      return false;
    }

    return true; // If passed all filters
  });

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // 移除本地的 formatDate 函數
  /*
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("zh-TW", options);
  };
  */

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">音樂會列表</h1>

      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter size={18} className="mr-2 text-indigo-600" />
            <span className="font-medium text-gray-700">過濾條件:</span>
          </div>

          <div className="flex items-center">
            <label htmlFor="timeframe" className="mr-2 text-gray-600">
              時間:
            </label>
            <select
              id="timeframe"
              className="p-2 border border-gray-300 rounded-md text-sm"
              value={filters.timeframe}
              onChange={(e) => handleFilterChange("timeframe", e.target.value)}
            >
              <option value="all">所有時間</option>
              <option value="upcoming">即將上演</option>
              <option value="past">過去演出</option>
            </select>
          </div>

          <div className="flex-grow">
            <input
              type="text"
              placeholder="搜尋藝術家..."
              className="p-2 border border-gray-300 rounded-md text-sm w-full"
              value={filters.artist}
              onChange={(e) => handleFilterChange("artist", e.target.value)}
            />
          </div>

          <div>
            <select
              className="p-2 border border-gray-300 rounded-md text-sm"
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
            >
              <option value="">所有類型</option>
              <option value="古典音樂">古典音樂</option>
              <option value="爵士樂">爵士樂</option>
              <option value="交響樂">交響樂</option>
              <option value="世界音樂">世界音樂</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcerts.length > 0 ? (
            filteredConcerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  {concert.posterUrl ? (
                    <img
                      src={concert.posterUrl}
                      alt={concert.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SimplePlaceholder
                      width="100%"
                      height="100%"
                      text={concert.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {concert.title}
                  </h2>

                  <div className="flex items-center text-gray-600 mb-2">
                    <User size={16} className="mr-1 text-indigo-600" />
                    <span>{concert.performer}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-1 text-indigo-600" />
                    {/* 使用導入的 formatDate */}
                    <span>
                      {formatDate(concert.date, 'zh-TW', { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {concert.performances &&
                        concert.performances.length > 1 && (
                          <span className="ml-1 text-xs text-indigo-600">
                            (多場次)
                          </span>
                        )}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <Music size={16} className="mr-1 text-indigo-600" />
                    <span>{concert.genre}</span>
                  </div>

                  <div className="flex justify-end items-center mt-auto pt-4">
                    {" "}
                    {/* 使用 justify-end 將按鈕推到右側, mt-auto 確保在底部 */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/concerts/${concert.id}`} // 確保路徑正確
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition duration-150 ease-in-out" // 稍微調整樣式
                      >
                        查看與購票 {/* <--- 暫定按鈕名稱 */}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <div className="text-gray-500 text-lg">
                沒有找到符合條件的音樂會
              </div>
              <p className="text-gray-400 mt-2">
                請嘗試調整過濾條件或確認後端數據是否已正確寫入
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConcertsPage;
