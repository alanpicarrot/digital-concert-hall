import React from 'react';
import PropTypes from 'prop-types';

/**
 * SimplePlaceholder 是一個輕量級的佔位圖元件，用於替代外部佔位圖請求
 * 使用內置的 SVG 渲染，無需外部圖片資源
 */
const SimplePlaceholder = ({ width, height, text, className }) => {
  // 將文字長度限制在合理範圍內
  const displayText = text ? 
    (text.length > 20 ? text.substring(0, 20) + '...' : text) : 
    'Placeholder';
  
  // 自動計算適當的字體大小
  const fontSize = Math.min(
    16, // 最大字體大小
    Math.max(10, // 最小字體大小
      Math.floor(((width || 400) / displayText.length) * 0.8) // 根據文字長度和容器寬度計算
    )
  );

  return (
    <svg
      width={width || "100%"}
      height={height || 200}
      viewBox={`0 0 ${width || 400} ${height || 300}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景填充 */}
      <rect width="100%" height="100%" fill="#E2E8F0" />
      
      {/* 邊框 */}
      <rect 
        width="calc(100% - 2px)" 
        height="calc(100% - 2px)" 
        x="1" 
        y="1" 
        fill="none" 
        stroke="#CBD5E0" 
        strokeWidth="2" 
      />
      
      {/* 顯示文字 */}
      <text
        x="50%"
        y="50%"
        fontFamily="sans-serif"
        fontSize={fontSize}
        fontWeight="bold"
        fill="#4A5568"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {displayText}
      </text>
    </svg>
  );
};

SimplePlaceholder.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  text: PropTypes.string,
  className: PropTypes.string
};

SimplePlaceholder.defaultProps = {
  width: "100%",
  height: 200,
  text: "Placeholder",
  className: ""
};

export default SimplePlaceholder;
