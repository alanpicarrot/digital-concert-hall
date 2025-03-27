import React from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Award, Music, User, Users } from "lucide-react";

const ArtistDetailPage = ({ artists, upcomingConcerts, pastConcerts }) => {
  const { id } = useParams();
  
  // 查找藝術家資料
  const artist = artists.find(a => a.id.toString() === id);
  
  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">找不到藝術家</h1>
        <p className="text-gray-600 mb-8">
          抱歉，我們找不到您要查詢的藝術家資料。
        </p>
        <Link
          to="/artists"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg"
        >
          返回藝術家列表
        </Link>
      </div>
    );
  }
  
  // 取得相關的音樂會
  const allConcerts = [...upcomingConcerts, ...pastConcerts];
  let relatedConcerts = [];
  
  if (artist.upcomingPerformances) {
    relatedConcerts = [
      ...relatedConcerts,
      ...artist.upcomingPerformances.map(id => allConcerts.find(c => c.id === id)).filter(Boolean)
    ];
  }
  
  if (artist.pastPerformances) {
    relatedConcerts = [
      ...relatedConcerts,
      ...artist.pastPerformances.map(id => allConcerts.find(c => c.id === id)).filter(Boolean)
    ];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/artists"
          className="text-indigo-600 hover:underline"
        >
          &larr; 返回藝術家列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={artist.image} 
              alt={artist.name} 
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
            <p className="text-xl text-gray-600 mb-4 flex items-center">
              {artist.type === "orchestra" ? (
                <Users className="mr-2" size={20} />
              ) : (
                <User className="mr-2" size={20} />
              )}
              {artist.type === "pianist" ? "鋼琴家" : 
                artist.type === "violinist" ? "小提琴家" : 
                artist.type === "cellist" ? "大提琴家" : 
                artist.type === "conductor" ? "指揮家" : 
                artist.type === "orchestra" ? "樂團" : artist.type}
            </p>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">藝術家介紹</h2>
              <p className="text-gray-700 mb-4">
                {artist.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Award className="mr-2" /> 主要成就
          </h2>
          <ul className="list-disc pl-5 text-gray-700 mb-6">
            {artist.achievements.map((achievement, index) => (
              <li key={index} className="mb-2">{achievement}</li>
            ))}
          </ul>
          
          {relatedConcerts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Music className="mr-2" /> 相關音樂會
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedConcerts.map((concert) => (
                  <div key={concert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
                    <p className="text-gray-600 mb-2">{concert.artist}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar size={16} className="mr-1" />
                      {concert.date} {concert.time}
                    </div>
                    <Link
                      to={`/concert/${concert.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      查看詳情 &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailPage;
