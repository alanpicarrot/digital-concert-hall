import React, { useState, useEffect } from 'react';
import FeatureFlags from '../../services/featureFlagService';

const DevToolsPage = () => {
  const [flags, setFlags] = useState({});
  
  useEffect(() => {
    // 獲取所有flags
    setFlags(FeatureFlags.getAllFlags());
  }, []);
  
  const toggleFlag = (flagName) => {
    const newValue = !flags[flagName];
    FeatureFlags.setFlag(flagName, newValue);
    setFlags({...flags, [flagName]: newValue});
  };
  
  const resetAllFlags = () => {
    FeatureFlags.resetAllFlags();
    setFlags(FeatureFlags.getAllFlags());
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">開發者工具</h1>
          <button 
            onClick={resetAllFlags}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            重置所有設置
          </button>
        </div>
        
        <div className="bg-gray-50 rounded p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Feature Flags</h2>
          
          <div className="space-y-4">
            {Object.keys(flags).map(flagName => (
              <div key={flagName} className="flex items-center justify-between p-3 border-b border-gray-200">
                <div>
                  <span className="font-medium">{flagName}</span>
                  {flagName === 'USE_REAL_PAYMENT' && (
                    <p className="text-sm text-gray-500 mt-1">
                      控制是否使用真實綠界支付或模擬支付
                    </p>
                  )}
                  {flagName === 'ENABLE_TICKET_GENERATION' && (
                    <p className="text-sm text-gray-500 mt-1">
                      控制是否在訂單完成後自動生成票券
                    </p>
                  )}
                  {flagName === 'DEBUG_MODE' && (
                    <p className="text-sm text-gray-500 mt-1">
                      啟用詳細日誌和開發調試功能
                    </p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={flags[flagName]}
                    onChange={() => toggleFlag(flagName)}
                  />
                  <div className={`w-11 h-6 rounded-full peer ${flags[flagName] ? 'bg-blue-600' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded p-4">
          <h2 className="text-xl font-semibold mb-4">系統狀態</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">模式</div>
              <div className="font-medium">{process.env.NODE_ENV || 'development'}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">API 基礎路徑</div>
              <div className="font-medium truncate">{process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">支付模式</div>
              <div className="font-medium">{flags.USE_REAL_PAYMENT ? '真實支付' : '模擬支付'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;