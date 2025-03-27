import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Play, Clock, Search } from "lucide-react";

const LivestreamsPage = ({ livestreams }) => {
  const [filter, setFilter] = useState("all"); // all, upcoming, available
  
  // 篩選直播
  const filteredStreams = livestreams.filter(stream => {
    if (filter === "all") return true;
    return stream.status === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">音樂會直播與點播</h1>
      
      {/* 篩選控制 */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          className={`px-4 py-2 rounded-full ${
            filter === "all" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("all")}
        >
          全部
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${
            filter === "upcoming" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("upcoming")}
        >
          即將直播
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${
            filter === "available" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setFilter("available")}
        >
          可觀看點播
        </button>
      </div>
      
      {/* 搜尋框 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋直播名稱或描述..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={18}
          />
        </div>
      </div>
      
      {/* 直播列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
          >
            <div className="relative">
              <img
                src={stream.image}
                alt={stream.title}
                className="w-full h-48 object-cover"
              />
              {stream.status === "upcoming" && (
                <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  即將直播
                </div>
              )}
              {stream.status === "available" && (
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  可點播觀看
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <Play size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{stream.title}</h3>
              <p className="text-gray-700 mb-3 line-clamp-2">
                {stream.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar size={16} className="mr-1" />
                {stream.date} {stream.time}
              </div>
              {stream.duration && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Clock size={16} className="mr-1" />
                  時長: {stream.duration}
                </div>
              )}
              <Link
                to={`/livestream/${stream.id}`}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded inline-block text-center"
              >
                {stream.status === "upcoming" ? "預約提醒" : "立即觀看"}
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filteredStreams.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg">沒有找到符合條件的直播</p>
        </div>
      )}
      
      {/* 訂閱提醒區塊 */}
      <div className="bg-indigo-100 rounded-lg p-6 mt-10">
        <h2 className="text-2xl font-bold mb-4">不要錯過任何直播</h2>
        <p className="mb-6">訂閱我們的直播提醒，在每次直播開始前收到通知。</p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="您的電子郵件"
            className="md:flex-grow px-4 py-3 rounded-lg border"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold">
            訂閱直播提醒
          </button>
        </div>
      </div>
    </div>
  );
};

export default LivestreamsPage;
