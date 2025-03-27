import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Music, Users } from "lucide-react";

const ArtistsPage = ({ artists }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // 篩選藝術家
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          artist.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || artist.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">藝術家</h1>

      {/* 搜尋和篩選 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="搜尋藝術家名稱或描述..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex space-x-4">
            <select 
              className="border rounded-lg px-4 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">所有類型</option>
              <option value="orchestra">樂團</option>
              <option value="pianist">鋼琴家</option>
              <option value="violinist">小提琴家</option>
              <option value="cellist">大提琴家</option>
              <option value="conductor">指揮家</option>
            </select>
          </div>
        </div>
      </div>

      {/* 藝術家列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
          >
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2">{artist.name}</h3>
              <p className="text-gray-600 mb-3 capitalize flex items-center">
                {artist.type === "orchestra" ? (
                  <Users className="mr-1" size={16} />
                ) : (
                  <Music className="mr-1" size={16} />
                )}
                {artist.type === "pianist" ? "鋼琴家" : 
                 artist.type === "violinist" ? "小提琴家" : 
                 artist.type === "cellist" ? "大提琴家" : 
                 artist.type === "conductor" ? "指揮家" : 
                 artist.type === "orchestra" ? "樂團" : artist.type}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-3">
                {artist.description.substring(0, 100)}...
              </p>
              <Link
                to={`/artist/${artist.id}`}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded inline-block text-center"
              >
                查看詳情
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArtists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">沒有找到符合條件的藝術家</p>
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
