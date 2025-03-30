# 數位音樂廳系統除錯記錄

## 問題描述

1. 在購票流程中，即使用戶已經登入，點選「立即購買」時系統仍要求再次登入
2. 登入後購票又被導向至登入頁面，形成循環
3. 大量 HTTP 500 錯誤來自圖片載入問題

## 開發環境

- 專案路徑: `/projects/alanp/digital-concert-hall`
- 日期: 2025-03-30

## 系統架構

- 前端: React (frontend-client)
- 後端: Java Spring Boot (backend)
- 鑑權方式: JWT token

## 診斷過程

### 分析錯誤日誌

首先分析了控制台日誌，發現：

```
[2025-03-30T07:50:46.372Z] [ERROR] API 錯誤: 401
[2025-03-30T07:50:46.372Z] [LOG] 偵測到 401 未授權錯誤，清除登入狀態
```

這顯示用戶在購票過程中授權狀態出現問題。

### 檢查圖片錯誤

控制台顯示大量圖片相關的 500 錯誤：

```
GET http://localhost:3000/api/placeholder/600/400?text=Beethoven 500 (Internal Server Error)
GET http://localhost:3000/api/placeholder/400/300?text=Gallery3 500 (Internal Server Error)
```

這些錯誤干擾了正常除錯過程。

## 問題的根本原因

1. **授權問題**:
   - 在 `ConcertDetailPage.jsx` 中缺少正確的購物車功能實現
   - 登入後重定向邏輯不穩健
   - 一些 API 請求沒有附加授權 token

2. **圖片載入問題**:
   - 前端使用 `/api/placeholder/...` 路徑尋找圖片，但系統實際路徑是 `/placeholder`
   - 或者這個佔位圖服務根本未實現

## 解決方案

### 授權流程修正

1. 修改 `ConcertDetailPage.jsx` 中的購物車功能:
   - 實現真實的 `handleAddToCart` 功能，連接到 cartService
   - 確保檢查用戶登入狀態

2. 增強登入重定向邏輯:
   - 修改 `Login.jsx` 以正確處理 URL 查詢參數
   - 增加錯誤處理和更多日誌輸出

3. 統一使用授權請求:
   - 改用 `authService.axiosInstance` 發送所有需要授權的請求

### 圖片問題解決

1. 創建內置的 SVG 佔位圖元件 `SimplePlaceholder`:
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

2. 修改音樂會圖片和圖庫渲染邏輯，使用內置佔位圖替代外部圖片請求

## 關鍵程式碼變更

### 1. 購票邏輯改進 (`ConcertDetailPage.jsx`):

```javascript
// 處理立即購買
const handleBuyNow = () => {
  if (!selectedSeatingArea) return;

  // 檢查用戶是否已登入
  if (!authService.getCurrentUser()) {
    // 如果用戶未登錄，導向登錄頁面並設置重定向回來
    alert('請先登入才能進行購票');
    navigate('/login?redirect=' + encodeURIComponent(`/concerts/${id}`));
    return;
  }

  // 將購票信息存入 sessionStorage，以便結帳頁面可以使用
  const ticketInfo = {
    concertId: concert.id,
    concertTitle: concert.title,
    ticketType: selectedSeatingArea.name,
    ticketPrice: selectedSeatingArea.price,
    quantity: quantity,
    totalAmount: calculateTotal(),
  };

  sessionStorage.setItem("checkoutInfo", JSON.stringify(ticketInfo));

  // 導航到結帳頁面
  navigate("/checkout");
};
```

### 2. 登入重定向改進 (`Login.jsx`):

```javascript
// 改進的登入後重定向處理
const searchParams = new URLSearchParams(location.search);
const redirectUrl = searchParams.get('redirect');
const from = redirectUrl || location.state?.from?.pathname || '/';

// 具體測試用戶認證狀態
const user = AuthService.getCurrentUser();
console.log('Current user after login:', user ? user.username : 'Unknown');

// 已穩定化的重定向處理
try {
  // 支援 URL 解碼，避免轉轉字符引來的問題
  let decodedPath = from;
  if (from.indexOf('%2F') !== -1 || from.indexOf('%3A') !== -1) {
    decodedPath = decodeURIComponent(from);
  }
  
  if (decodedPath.startsWith('/')) {
    // 如果是完整的URL路徑，則直接導航
    navigate(decodedPath, { replace: true });
  } else if (decodedPath.startsWith('http')) {
    // 如果是外部鏈接，重定向到首頁
    navigate('/', { replace: true });
  } else {
    // 否則作為相對路徑處理
    navigate('/' + decodedPath, { replace: true });
  }
} catch (e) {
  console.error('Redirect error:', e);
  // 重定向發生錯誤時，預設導到首頁
  navigate('/', { replace: true });
}
```

### 3. 授權攔截器改進 (`authService.js`):

```javascript
// 響應攔截器，處理常見錯誤（如401未授權）
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 錯誤:', error.response ? error.response.status : error.message);
    
    // 處理 401 未授權錯誤 (令牌過期或無效)
    if (error.response && error.response.status === 401) {
      console.log('偵測到 401 未授權錯誤，清除登入狀態');
      
      // 如果收到401錯誤且不是在登入或註冊頁面，則登出用戶
      const currentPath = window.location.pathname;
      const currentUrl = window.location.href;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/reset-password')
      ) {
        logout();
        
        // 顯示通知（可選）
        alert('您的登入已過期，請重新登入');
        
        // 保存當前頁面路徑用於登入後重定向
        const redirectPath = encodeURIComponent(currentPath);
        
        // 重定向到登入頁面，並帶上當前頁面作為重定向參數
        window.location.href = `/login?redirect=${redirectPath}`;
      }
    }
    return Promise.reject(error);
  }
);
```

## 測試案例

1. **已登入用戶購票測試**
   - 登入系統 → 瀏覽音樂會詳情 → 選擇座位 → 點擊「立即購買」
   - 預期結果：直接進入結帳頁面，不再被要求登入

2. **未登入用戶購票測試**
   - 未登入狀態 → 瀏覽音樂會詳情 → 選擇座位 → 點擊「立即購買」
   - 預期結果：被導向登入頁面，登入後自動返回並繼續購票流程

3. **圖片載入測試**
   - 預期結果：所有佔位圖顯示正確，不再出現 HTTP 500 錯誤

## 結論

這次修復解決了三個主要問題：

1. **購票流程中的登入循環問題**：通過改進授權狀態處理和重定向邏輯
2. **圖片載入 500 錯誤**：通過實現內置 SVG 佔位圖元件
3. **購物車功能缺失**：通過完整實現購物車相關功能

這些修改使系統更加穩定，用戶體驗得到改善，同時也消除了影響測試的干擾因素。

## 開發者

- 調試日期：2025-03-30
