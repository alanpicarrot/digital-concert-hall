# 代碼修改摘要

本文檔總結了本次會話中對數位音樂廳前端進行的主要代碼變更。

## 布局文件 (MainLayout.jsx)

主要變更：

1. **導航欄結構調整**
   ```jsx
   // 從:
   <header className="bg-white shadow-md">
     <div className="container mx-auto px-4 py-3 flex justify-between items-center">
       <div className="flex items-center space-x-4">
         <Link to="/" className="text-2xl font-bold text-indigo-600">數位音樂廳</Link>
         <nav className="hidden md:flex space-x-6">
           ...
         </nav>
       </div>
     </div>
   </header>

   // 變更為:
   <header className="bg-indigo-900">
     <div className="container mx-auto px-8 py-4 flex justify-between items-center">
       <div>
         <Link to="/" className="text-2xl font-bold text-white">數位音樂廳</Link>
       </div>
       <div className="flex items-center space-x-8">
         <nav className="hidden md:flex items-center space-x-8">
           ...
         </nav>
         ...
       </div>
     </div>
   </header>
   ```

2. **用戶下拉選單改進**
   ```jsx
   // 從基於懸停的下拉選單:
   <div className="relative group">
     <button className="text-gray-700 hover:text-indigo-600">
       {user?.username}
     </button>
     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
       ...
     </div>
   </div>

   // 變更為基於點擊的下拉選單:
   <div className="relative">
     <button 
       onClick={toggleMenu}
       className="flex items-center text-white hover:text-indigo-300 text-sm font-medium"
     >
       <User size={16} className="mr-1" />
       {user?.username}
       <ChevronDown size={16} className="ml-1" />
     </button>
     {isMenuOpen && (
       <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
         ...
       </div>
     )}
   </div>
   ```

3. **購物車圖標變更**
   ```jsx
   // 從:
   <Link to="/cart" className="text-gray-700 hover:text-indigo-600">購物車</Link>

   // 變更為:
   <Link to="/cart" className="text-white">
     <ShoppingCart size={20} />
   </Link>
   ```

## 首頁文件 (HomePage.jsx)

主要變更：

1. **特色演出區塊**
   ```jsx
   // 從:
   <div className="relative rounded-lg overflow-hidden mb-8 bg-gray-800 h-64 flex items-center justify-center">
     <img
       src="/api/placeholder/1200/400"
       alt="Featured concert"
       className="w-full h-full object-cover absolute opacity-50"
     />
     <div className="z-10 text-center text-white p-4">
       ...
     </div>
   </div>

   // 變更為:
   <div className="max-w-6xl mx-auto px-4 py-4">
     <div className="bg-gray-900 rounded-lg overflow-hidden">
       <div className="py-12 px-8 text-center text-white">
         ...
       </div>
     </div>
   </div>
   ```

2. **即將上演的音樂會區塊**
   ```jsx
   // 從:
   <section className="mb-12">
     <div className="flex justify-between items-center mb-4">
       <h2 className="text-2xl font-bold">即將上演的音樂會</h2>
       <Link to="/concerts" className="text-indigo-600 hover:text-indigo-800">查看全部</Link>
     </div>
     ...
   </section>

   // 變更為:
   <section className="py-8">
     <div className="max-w-6xl mx-auto px-4">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold">即將上演的音樂會</h2>
         <Link to="/concerts" className="text-indigo-700 hover:text-indigo-800 text-sm">查看全部</Link>
       </div>
       ...
     </div>
   </section>
   ```

3. **音樂會卡片樣式**
   ```jsx
   // 從:
   <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
     <img src={concert.image} alt={concert.title} className="w-full h-40 object-cover" />
     <div className="p-4">
       <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
       <p className="text-gray-600 mb-2">{concert.artist}</p>
       <div className="flex items-center text-sm text-gray-500 mb-3">
         <Calendar size={16} className="mr-1" />
         {concert.date} {concert.time}
       </div>
       <Link to={`/concert/${concert.id}`}
         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded inline-block text-center">
         立即購票
       </Link>
     </div>
   </div>

   // 變更為:
   <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
     <img src={concert.image} alt={concert.title} className="w-full h-40 object-cover" />
     <div className="p-4">
       <h3 className="font-bold text-lg">{concert.title}</h3>
       <p className="text-gray-600 text-sm">{concert.artist}</p>
       <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
         <Calendar size={14} className="mr-1" />
         {concert.date} {concert.time}
       </div>
       <Link to={`/concert/${concert.id}`}
         className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-center inline-block">
         立即購票
       </Link>
     </div>
   </div>
   ```

4. **精選回放區塊**
   ```jsx
   // 從:
   <section>
     <div className="flex justify-between items-center mb-4">
       <h2 className="text-2xl font-bold">精選回放</h2>
       <Link to="/concerts" className="text-indigo-600 hover:text-indigo-800">查看全部</Link>
     </div>
     ...
   </section>

   // 變更為:
   <section className="py-8 bg-gray-50">
     <div className="max-w-6xl mx-auto px-4">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold">精選回放</h2>
         <Link to="/recordings" className="text-indigo-700 hover:text-indigo-800 text-sm">查看全部</Link>
       </div>
       ...
     </div>
   </section>
   ```

5. **播放按鈕樣式**
   ```jsx
   // 從:
   <div className="absolute inset-0 flex items-center justify-center">
     <div className="bg-black bg-opacity-50 rounded-full p-3">
       <Play size={24} className="text-white" />
     </div>
   </div>

   // 變更為:
   <div className="absolute inset-0 flex items-center justify-center">
     <div className="bg-gray-600 rounded-full p-2 opacity-80">
       <Play size={24} className="text-white" />
     </div>
   </div>
   ```

## 狀態管理變更 (在 MainLayout.jsx 中)

新增了用於控制用戶下拉選單的狀態管理：

```jsx
// 新增狀態控制
const [isMenuOpen, setIsMenuOpen] = useState(false);

// 新增切換函數
const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};

// 在選單項目中添加關閉邏輯
<Link 
  to="/user/profile" 
  className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
  onClick={() => setIsMenuOpen(false)}
>
  個人資料
</Link>

// 在登出中添加關閉邏輯
<button 
  onClick={() => {
    logout();
    setIsMenuOpen(false);
  }}
  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 text-sm"
>
  登出
</button>
```

## 總結

這些代碼變更使前端界面更符合設計規範，特別是以下方面：

1. **視覺一致性**：深紫色調導航欄，統一的按鈕和卡片樣式
2. **布局優化**：導航項目移至右側，主要內容區域的最大寬度限制
3. **交互體驗**：用戶下拉選單的點擊交互方式，購物車圖標化
4. **響應式設計**：保持了原有的響應式布局特性，同時優化了桌面視圖

這些變更不僅使界面外觀更加精美，也提高了整體的用戶體驗。
