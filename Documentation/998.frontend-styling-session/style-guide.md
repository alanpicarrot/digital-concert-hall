# 數位音樂廳前端樣式指南

## 顏色系統

### 主要顏色

- **主題色**: 深藍紫色 (`bg-indigo-900`) - 用於頁面主要背景如導航欄和頁腳
- **強調色**: 靛藍色 (`bg-indigo-600` & `bg-indigo-500`) - 用於按鈕和可交互元素
- **背景色**: 白色 (`bg-white`) - 用於內容區域
- **分隔背景**: 淺灰色 (`bg-gray-50`) - 用於分隔不同的內容區塊
- **深色背景**: 深灰色 (`bg-gray-900`) - 用於特色內容區域

### 文字顏色

- **主要文字**: 黑色 / 深灰色 (`text-gray-900`) - 用於標題和重要內容
- **次要文字**: 中灰色 (`text-gray-600`) - 用於描述性內容
- **輔助文字**: 淺灰色 (`text-gray-500`) - 用於日期和輔助信息
- **白色文字**: 白色 (`text-white`) - 用於深色背景上的文字
- **高亮文字**: 靛藍色 (`text-indigo-700`) - 用於鏈接和強調文字

## 排版

### 字體大小

- **大標題**: 2xl (`text-2xl`)
- **中標題**: xl (`text-xl`)
- **小標題**: lg (`text-lg`)
- **正文**: 基本大小 (默認)
- **輔助文字**: sm (`text-sm`)

### 字重

- **加粗標題**: 粗體 (`font-bold`)
- **次級標題**: 半粗體 (`font-semibold`)
- **普通文字**: 正常字重 (默認)
- **強調文字**: 中等字重 (`font-medium`)

## 組件樣式

### 按鈕

#### 主要按鈕

```html
<button class="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded">
  按鈕文字
</button>
```

#### 次要按鈕

```html
<button class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded">
  按鈕文字
</button>
```

#### 連結按鈕

```html
<a class="text-indigo-700 hover:text-indigo-800">
  連結文字
</a>
```

### 卡片

```html
<div class="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
  <!-- 卡片內容 -->
  <div class="p-4">
    <h3 class="font-bold text-lg">標題</h3>
    <p class="text-gray-600 text-sm">描述</p>
  </div>
</div>
```

### 導航項目

```html
<Link class="text-white hover:text-indigo-300 text-sm font-medium">
  導航項目
</Link>
```

## 頁面結構

### 導航欄

- 深藍紫色背景 (`bg-indigo-900`)
- 左側顯示Logo
- 右側顯示導航項目和用戶操作
- 適當的間距和對齊

### 主要內容區域

- 白色背景，最大寬度 6xl (`max-w-6xl`)
- 左右內邊距 (`px-4`)
- 上下內邊距 (`py-8`)

### 頁腳

- 深藍紫色背景 (`bg-indigo-900`)
- 四欄布局設計
- 白色和淺灰色文字
- 標題使用半粗體 (`font-semibold`)

## 響應式設計指南

- 使用 `md:` 前綴處理中等屏幕的樣式變化
- 使用 Flexbox 和 Grid 實現響應式布局
- 移動端導航可考慮使用漢堡菜單
- 卡片在移動端單列顯示，桌面端多列顯示

## 圖標使用

使用 `lucide-react` 庫中的圖標：

- 購物車圖標 (`<ShoppingCart />`)
- 用戶圖標 (`<User />`)
- 日曆圖標 (`<Calendar />`)
- 播放圖標 (`<Play />`)
- 下拉箭頭 (`<ChevronDown />`)

## 交互設計

- 懸停效果使用 `hover:` 前綴
- 點擊區域足夠大，易於交互
- 下拉菜單使用點擊觸發，並在點擊後保持顯示
- 表單元素有清晰的焦點狀態

## 應用示例

此樣式指南應用於前端的各個部分，包括但不限於：

1. 首頁的特色演出區域
2. 音樂會列表頁
3. 詳情頁
4. 結帳流程
5. 用戶賬戶頁面
