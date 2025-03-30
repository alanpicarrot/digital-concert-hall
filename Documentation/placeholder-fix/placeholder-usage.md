# SimplePlaceholder 元件使用指南

## 問題背景

數位音樂廳專案中，之前使用了外部佔位圖服務，如：
```
/api/placeholder/{width}/{height}?text={text}
```

這些請求會導致 HTTP 500 錯誤，因為服務器上沒有實際實現這個 API 端點。

## 解決方案

專案中已經實現了 `SimplePlaceholder` 元件（位於 `src/components/ui/SimplePlaceholder.jsx`），它使用 SVG 直接在前端生成佔位圖，無需向服務器發送請求。這個元件已經在多個頁面中使用，包括：

- `HomePage.jsx`
- `ConcertDetailPage.jsx`
- `ConcertsPage.jsx`

## 如何使用 SimplePlaceholder 元件

### 1. 導入元件

```jsx
import SimplePlaceholder from "../../components/ui/SimplePlaceholder";
```

### 2. 基本用法

```jsx
<SimplePlaceholder 
  width={400} 
  height={300} 
  text="我的佔位圖" 
/>
```

### 3. 結合 CSS 類使用

```jsx
<SimplePlaceholder 
  width="100%" 
  height={200} 
  text="響應式佔位圖"
  className="w-full h-40 object-cover rounded-lg" 
/>
```

### 4. 條件渲染（有圖片時使用真實圖片，無圖片時使用佔位圖）

```jsx
{concert.image ? (
  <img
    src={concert.image}
    alt={concert.title}
    className="w-full h-40 object-cover"
  />
) : (
  <SimplePlaceholder
    width="100%"
    height={160}
    text={concert.title}
    className="w-full h-40 object-cover"
  />
)}
```

## 元件參數說明

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| width | string/number | "100%" | 佔位圖寬度，可以是像素值或百分比 |
| height | string/number | 200 | 佔位圖高度，可以是像素值或百分比 |
| text | string | "Placeholder" | 顯示在佔位圖中的文字 |
| className | string | - | 額外的 CSS 類名 |

## 元件特點

1. **無外部依賴**：完全使用 React 和 SVG 實現，無需外部圖片服務
2. **效能優良**：輕量級 SVG 渲染，不需要額外的網絡請求
3. **可自定義**：靈活設置尺寸、文字和樣式
4. **避免錯誤**：消除了因外部圖片請求失敗導致的 HTTP 錯誤
5. **智能文字處理**：自動調整字體大小和截斷過長的文字

## 使用場景

在數位音樂廳專案中，主要用於以下場景：

1. 音樂會海報圖片
2. 圖片庫佔位圖
3. 當實際圖片未提供時的備用方案

## 代碼實現

`SimplePlaceholder` 元件的實現包括：

- 文字長度限制，確保文字適合顯示區域
- 自動計算適當的字體大小
- 背景填充和邊框樣式
- 居中顯示文字

## 長期建議

這個元件是為了解決開發階段的圖片錯誤問題。長期來看，建議：

1. 實現實際的佔位圖服務端點
2. 或使用真實的圖片資源
3. 保留 `SimplePlaceholder` 作為備用方案
