import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import storageService from '../../services/storageService';
import SimplePlaceholder from '../ui/SimplePlaceholder';

const ConcertHistory = ({ limit = 4, className = '' }) => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加載瀏覽歷史
  useEffect(() => {
    setLoading(true);
    
    try {
      const history = storageService.history.getConcerts(limit);
      setConcerts(history);
    } catch (error) {
      console.error('Failed to load concert history:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 如果沒有歷史記錄
  if (!loading && concerts.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <History size={18} className="mr-2 text-indigo-500" />
          <h2 className="text-lg font-semibold">最近瀏覽</h2>
        </div>

        {concerts.length > 0 && (
          <button 
            onClick={() => storageService.history.clear()}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            清除歷史
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {concerts.map((concert, index) => (
            <Link
              key={index}
              to={`/concerts/${concert.id}`}
              className="block relative group overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {concert.posterUrl ? (
                <img
                  src={concert.posterUrl}
                  alt={concert.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <SimplePlaceholder
                  width="100%"
                  height={128}
                  text={concert.title}
                  className="w-full h-32 group-hover:opacity-90 transition-opacity"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-2 text-white">
                  <h3 className="text-sm font-medium line-clamp-1">{concert.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs opacity-80">
                      {new Date(concert.timestamp).toLocaleDateString()}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertHistory;