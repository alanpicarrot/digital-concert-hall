import React, { useState, useEffect } from 'react';
import { getMockDataStatus, onMockDataUsed } from '../../utils/mockDataUtils';

/**
 * 模擬數據指示器組件
 * 用於在使用模擬數據時在界面上顯示提示
 */
const MockDataIndicator = ({ position = 'bottom-right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mockStatus, setMockStatus] = useState({});
  
  // 計算是否有任何類型的模擬數據正在使用
  const anyMockDataUsed = Object.values(mockStatus).some(value => value);
  
  useEffect(() => {
    // 初始檢查模擬數據狀態
    const initialStatus = getMockDataStatus();
    setMockStatus(initialStatus);
    
    // 如果初始狀態中有任何模擬數據使用，則顯示指示器
    setIsVisible(Object.values(initialStatus).some(value => value));
    
    // 監聽模擬數據使用事件
    const unsubscribe = onMockDataUsed((detail) => {
      setMockStatus(prev => ({
        ...prev,
        [detail.type]: true
      }));
      setIsVisible(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  // 如果沒有模擬數據，不顯示指示器
  if (!anyMockDataUsed) return null;
  
  // 根據位置設置樣式
  let positionClass = 'fixed';
  switch (position) {
    case 'top-left':
      positionClass += ' top-4 left-4';
      break;
    case 'top-right':
      positionClass += ' top-4 right-4';
      break;
    case 'bottom-left':
      positionClass += ' bottom-4 left-4';
      break;
    case 'bottom-right':
    default:
      positionClass += ' bottom-4 right-4';
      break;
  }
  
  return (
    <div className={`${positionClass} bg-orange-500 text-white px-3 py-2 rounded-md shadow-lg z-50 flex items-center space-x-2`}>
      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      <span className="font-medium text-sm">使用模擬數據模式</span>
      {isVisible && (
        <button 
          onClick={() => setIsVisible(false)} 
          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default MockDataIndicator;