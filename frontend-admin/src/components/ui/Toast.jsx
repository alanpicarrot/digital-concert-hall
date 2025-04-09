import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// 定義不同通知類型的樣式
const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <Check className="text-green-500" size={20} />,
    iconBg: 'bg-green-100',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="text-red-500" size={20} />,
    iconBg: 'bg-red-100',
    title: 'text-red-800',
    message: 'text-red-700'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertCircle className="text-amber-500" size={20} />,
    iconBg: 'bg-amber-100',
    title: 'text-amber-800',
    message: 'text-amber-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="text-blue-500" size={20} />,
    iconBg: 'bg-blue-100',
    title: 'text-blue-800',
    message: 'text-blue-700'
  }
};

const Toast = ({ type = 'info', title, message, onClose, duration = 5000, showProgress = true }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const style = toastStyles[type] || toastStyles.info;

  // 控制通知的顯示和隱藏
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // 等待淡出動畫完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 控制進度條的減少
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, showProgress]);

  // 手動關閉通知
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed top-4 right-4 max-w-md z-50 transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      <div className={`rounded-lg shadow-md border ${style.bg} ${style.border} p-4`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-2 mr-3`}>
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            {title && <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>}
            {message && <p className={`text-sm mt-1 ${style.message}`}>{message}</p>}
            
            {/* 進度條 */}
            {showProgress && (
              <div className="h-1 w-full bg-gray-200 rounded mt-2">
                <div 
                  className={`h-1 rounded transition-all duration-100 ease-linear ${
                    type === 'success' ? 'bg-green-500' :
                    type === 'error' ? 'bg-red-500' :
                    type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
          <button 
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;