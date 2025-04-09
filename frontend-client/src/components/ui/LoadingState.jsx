import React from 'react';
import { Music } from 'lucide-react';

const LoadingState = ({
  message = '載入中...',
  size = 'default',
  type = 'spinner',
  className = ''
}) => {
  // 大小選項
  const sizeClasses = {
    small: 'h-16',
    default: 'h-32',
    large: 'h-64',
    fullscreen: 'h-screen'
  };

  // 選擇尺寸類
  const heightClass = sizeClasses[size] || sizeClasses.default;

  // 音樂相關的加載動畫 - 使用CSS動畫模擬音樂波形
  if (type === 'music') {
    return (
      <div className={`flex flex-col items-center justify-center ${heightClass} ${className}`}>
        <div className="flex items-end h-16 space-x-1">
          {/* 音波動畫 */}
          {[...Array(5)].map((_, index) => (
            <div 
              key={index}
              className="w-2 bg-indigo-500 rounded-t-sm"
              style={{
                height: `${Math.max(20, Math.random() * 64)}%`,
                animation: `musicBounce 1.2s ease-in-out ${index * 0.2}s infinite`
              }}
            ></div>
          ))}
        </div>
        <div className="flex items-center mt-4 text-indigo-700">
          <Music size={20} className="mr-2" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        
        {/* 為音波動畫添加的樣式 */}
        <style jsx>{`
          @keyframes musicBounce {
            0%, 100% {
              height: 20%;
            }
            50% {
              height: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // 默認加載動畫 - 使用一個優雅的轉動動畫
  return (
    <div className={`flex flex-col items-center justify-center ${heightClass} ${className}`}>
      <div className="w-12 h-12 relative">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-indigo-200 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 right-0 bottom-0 border-4 border-l-indigo-600 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"
        ></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;