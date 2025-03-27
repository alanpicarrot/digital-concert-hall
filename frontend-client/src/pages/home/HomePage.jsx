import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Play, Loader2 } from "lucide-react";
import axios from 'axios';

const HomePage = () => {
  const [upcomingConcerts, setUpcomingConcerts] = useState([]);
  const [pastConcerts, setPastConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        // 模擬從API獲取數據的延遲
        setTimeout(() => {
          // 模擬數據
          const mockUpcomingConcerts = [
            {
              id: 1,
              title: "貝多芬第九號交響曲",
              artist: "臺北交響樂團",
              date: "2025/04/15",
              time: "19:30",
              image: "/api/placeholder/400/240"
            },
            {
              id: 2,
              title: "莫札特鋼琴協奏曲",
              artist: "網寧家王小明與北交響樂團",
              date: "2025/04/22",
              time: "19:30",
              image: "/api/placeholder/400/240"
            },
            {
              id: 3,
              title: "巴赫無伴奏大提琴組曲",
              artist: "大提琴家李大華",
              date: "2025/05/01",
              time: "19:30",
              image: "/api/placeholder/400/240"
            }
          ];
          
          const mockPastConcerts = [
            {
              id: 101,
              title: "蕭邦夜曲集",
              artist: "鋼琴家陳嘉儀",
              date: "2025/03/10",
              image: "/api/placeholder/400/240"
            },
            {
              id: 102,
              title: "德布西印象集",
              artist: "鋼琴家張小剛",
              date: "2025/02/20",
              image: "/api/placeholder/400/240"
            }
          ];
          
          setUpcomingConcerts(mockUpcomingConcerts);
          setPastConcerts(mockPastConcerts);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching concerts:', err);
        setError('無法載入音樂會數據，請稍後再試。');
        setLoading(false);
      }
    };
    
    fetchConcerts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
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
            <h1 className="text-2xl font-bold mb-2">貝多芬第九號交響曲</h1>
            <p className="text-lg mb-1">臺北交響樂團</p>
            <p className="text-base mb-6">2025年4月15日 19:30</p>
            <Link
              to="/concerts/1"
              className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-10 rounded inline-block"
            >
              立即購票
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
            {upcomingConcerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
              >
                <img
                  src={concert.image}
                  alt={concert.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{concert.title}</h3>
                  <p className="text-gray-600 text-sm">{concert.artist}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                    <Calendar size={14} className="mr-1" />
                    {concert.date} {concert.time}
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

      {/* 精選回放 */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">精選回放</h2>
            <Link to="/recordings" className="text-indigo-700 hover:text-indigo-800 text-sm">
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
                  <img
                    src={concert.image}
                    alt={concert.title}
                    className="w-full h-40 object-cover"
                  />
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
