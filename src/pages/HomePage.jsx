import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Play } from "lucide-react";

const HomePage = ({ upcomingConcerts, pastConcerts }) => (
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
        <Link
          to="/concert/1"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full inline-block"
        >
          立即購票
        </Link>
      </div>
    </div>

    {/* 即將上演的音樂會 */}
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">即將上演的音樂會</h2>
        <Link
          to="/concerts"
          className="text-indigo-600 hover:text-indigo-800"
        >
          查看全部
        </Link>
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
    </section>

    {/* 精選回放 */}
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">精選回放</h2>
        <Link to="/concerts" className="text-indigo-600 hover:text-indigo-800">
          查看全部
        </Link>
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
              <Link
                to={`/livestream/${concert.id}`}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded inline-block text-center"
              >
                購票觀看
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default HomePage;
