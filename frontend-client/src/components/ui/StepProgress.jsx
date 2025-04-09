import React from 'react';
import { Check } from 'lucide-react';

const StepProgress = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          // 計算每個步驟的狀態
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <li 
              key={index} 
              className={`flex items-center ${isLast ? '' : 'w-full'}`}
            >
              <div className="flex flex-col items-center">
                {/* 步驟圖標 */}
                <div 
                  className={`z-10 flex items-center justify-center w-8 h-8 rounded-full 
                    ${isComplete ? 'bg-indigo-600 text-white' : 
                      isActive ? 'border-2 border-indigo-600 bg-white text-indigo-600' : 
                      'border-2 border-gray-300 bg-white text-gray-300'}`}
                >
                  {isComplete ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* 步驟標題 */}
                <div className={`mt-2 text-xs sm:text-sm text-center ${
                  isActive ? 'text-indigo-600 font-medium' : 
                  isComplete ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
              </div>
              
              {/* 連接線 */}
              {!isLast && (
                <div className={`w-full h-0.5 mx-2 sm:mx-4 ${
                  isComplete ? 'bg-indigo-600' : 'bg-gray-300'
                }`}></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepProgress;