import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PageHeader = ({ 
  title, 
  subtitle, 
  backLink, 
  backText = '返回',
  icon,
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* 面包屑導航 */}
      {backLink && (
        <div className="mb-4">
          <Link 
            to={backLink} 
            className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>{backText}</span>
          </Link>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {/* 可選的圖標 */}
          {icon && (
            <div className="mr-4 text-indigo-600">
              {icon}
            </div>
          )}
          
          <div>
            {/* 標題 */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            
            {/* 副標題 */}
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* 右側動作按鈕 */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
      
      {/* 分隔線 */}
      <div className="h-px w-full bg-gray-200 mt-4"></div>
    </div>
  );
};

export default PageHeader;