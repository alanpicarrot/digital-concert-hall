import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Search } from "lucide-react";

const ConcertsPage = ({ upcomingConcerts, pastConcerts }) => (
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
            <Link
              to={`/concert/${concert.id}`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded inline-block text-center"
            >
              立即購票
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ConcertsPage;
