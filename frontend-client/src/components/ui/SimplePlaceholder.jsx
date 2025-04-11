import React from "react";

/**
 * SimplePlaceholder 是一個輕量級的佔位圖元件，用於替代外部佔位圖請求
 * 使用內置的 SVG 渲染，無需外部圖片資源
 */
const SimplePlaceholder = ({
  width = "100%",
  height = "100%",
  text = "",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 ${className}`}
      style={{ width, height }}
    >
      <span className="text-gray-500">{text}</span>
    </div>
  );
};

export default SimplePlaceholder;
