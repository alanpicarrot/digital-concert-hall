# 使用 SimplePlaceholder 元件

## 概述

`SimplePlaceholder` 是一個輕量級的佔位圖元件，用於在數位音樂廳系統中替代外部圖片請求，解決開發過程中遇到的圖片載入 500 錯誤問題。此元件提供內置的 SVG 渲染，無需外部圖片資源。

## 問題背景

在系統開發過程中，我們遇到了以下圖片相關問題：

1. 使用 `/api/placeholder/...` 路徑請求佔位圖片
2. 這些請求返回大量 HTTP 500 錯誤
3. 這些錯誤不僅影響 UI 呈現，還干擾了其他功能的除錯

## 解決方案

創建 `SimplePlaceholder` 元件，完全使用 React 和 SVG 實現內置的佔位圖顯示，消除對外部圖片服務的依賴。

## 元件代碼

```jsx
const SimplePlaceholder = ({ width, height, text, className }) => {
  return (
    <svg
      width={width || "100%"}
      height={height || 200}
      viewBox={`0 0 ${width || 400} ${height || 300}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100%" height="100%" fill="#E2E8F0" />
      <rect width="calc(100% - 2px)" height="calc(100% - 2px)" x="1" y="1" fill="none" stroke="#CBD5E0" strokeWidth="2" />
      <text
        x="50%"
        y="50%"
        fontFamily="sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#4A5568"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {text || "Placeholder"}
      </text>
    </svg>
  )
}
```

## 使用方法

### 基本用法

```jsx
<SimplePlaceholder 
  width={400} 
  height={300} 
  text="圖片佔位" 
/>
```

### 使用 CSS 類名

```jsx
<SimplePlaceholder 
  width="100%" 
  height={200} 
  text="圖片佔位"
  className="rounded-lg shadow-md" 
/>
```

### 在條件渲染中使用

```jsx
{image ? (
  <img
    src={image}
    alt={title}
    className="w-full h-96 object-cover"
  />
) : (
  <SimplePlaceholder 
    width="100%" 
    height={384} 
    text={title}
    className="w-full h-96 object-cover" 
  />
)}
```

## 參數說明

| 參數 | 類型 | 默認值 | 描述 |
|------|------|--------|------|
| width | string/number | "100%" | 圖片寬度，可以是像素值或百分比 |
| height | string/number | 200 | 圖片高度，可以是像素值或百分比 |
| text | string | "Placeholder" | 顯示在圖片中的文字 |
| className | string | - | 額外的 CSS 類名 |

## 應用場景

在數位音樂廳系統中，主要用於以下場景：

1. 音樂會封面圖片
2. 圖片庫佔位圖
3. 當實際圖片未提供時的備用方案

## 優點

1. **零外部依賴**: 完全使用 React 和 SVG 實現，無需外部圖片服務
2. **性能優良**: 輕量級 SVG 渲染，不需要額外的網絡請求
3. **可自定義**: 靈活設置尺寸、文字和樣式
4. **避免錯誤**: 消除了因外部圖片請求失敗導致的 HTTP 錯誤

## 長期建議

這個元件主要用於開發階段解決圖片請求錯誤問題。長期來看，建議：

1. 實現一個真實的佔位圖服務
2. 或使用第三方的圖片佔位服務，如 [Placeholder.com](https://placeholder.com/) 或 [PlaceIMG](https://placeimg.com/)
3. 最終替換為真實的圖片資源

## 示例

### 音樂會封面佔位圖

```jsx
<div className="relative">
  {concert.image ? (
    <img
      src={concert.image}
      alt={concert.title}
      className="w-full h-96 object-cover object-center"
    />
  ) : (
    <SimplePlaceholder 
      width="100%" 
      height={384} 
      text={concert.title}
      className="w-full h-96 object-cover object-center" 
    />
  )}
</div>
```

### 圖庫佔位圖

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {concert.galleryItems && concert.galleryItems.map((item, index) => (
    <div key={index} className="relative aspect-w-4 aspect-h-3 h-60">
      <SimplePlaceholder 
        width="100%" 
        height="100%" 
        text={item}
        className="object-cover rounded-lg w-full h-full" 
      />
    </div>
  ))}
</div>
```

## 注意事項

1. SVG 元素的 `viewBox` 屬性需要設置正確以確保正確的縮放
2. 文字大小不會隨著元素縮放而自動調整，可能需要根據使用場景調整
3. 在生產環境中，應考慮替換為真實圖片或更專業的佔位圖解決方案
