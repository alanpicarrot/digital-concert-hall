# 數位音樂廳除錯記錄

日期：2025年4月11日

## 問題描述

用戶報告了以下問題：
1. 立即購票按鈕指向http://localhost:3000/tickets/performance/1，這是一個空白的頁面，沒有辦法購買票券。
2. 點選中央的購票資訊，可以看到加入購物車和立即購買的按鈕，即使用戶已經登入，點擊這些按鈕仍顯示需要先登入的alert。
3. 除錯路徑：/Users/alanp/digital-concert-hall

## 問題解析

經過代碼審查，發現了以下幾個問題：

1. **路由問題**：AppRoutes.jsx 中缺少了 `/tickets/performance/:id` 路由的定義，導致按鈕點擊後顯示空白頁面。

2. **身份驗證邏輯問題**：
   - authService.js 中的 `getCurrentUser` 函數會在公開路由上總是返回 null，即使用戶已登入
   - 認證狀態管理存在問題，導致即使已登入，系統仍無法正確識別身份

3. **Local Storage 處理**：
   - 在某些情況下，清理 token 和用戶數據的方法不一致
   - 登入/登出流程中的狀態管理不完善

## 修復方案

### 1. 修復路由問題

添加缺少的路由並確保相關組件被正確導入：

```javascript
// AppRoutes.jsx 修改
import PerformanceTicketsPage from '../pages/tickets/PerformanceTicketsPage';

// 在路由配置中添加
<Route path="/tickets/performance/:id" element={<PerformanceTicketsPage />} />
```

### 2. 修復身份驗證檢查

更新 authService.js 中的 getCurrentUser 函數，不再根據路由區分：

```javascript
// 獲取當前用戶信息
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const user = JSON.parse(userStr);
    return { ...user, accessToken: token };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
```

### 3. 增強令牌驗證

添加對令牌格式的檢查：

```javascript
// 在 AuthContext 的 useEffect 中添加
// 驗證令牌格式
const tokenParts = token.split('.');
if (tokenParts.length !== 3) {
  console.error('令牌格式不正確');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  setIsAuthenticated(false);
  setLoading(false);
  return;
}
```

### 4. 改進登入/登出流程

確保登入前清理舊數據，並在登出時直接操作 localStorage：

```javascript
// 登入函數優化
const login = async (username, password) => {
  try {
    setLoading(true);
    // 先清除可能存在的舊登入資料
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // 調用 AuthService 的登入方法
    const userData = await AuthService.login(username, password);
    // ... 其餘代碼
  }
  // ... 其餘代碼
};

// 登出函數優化
const logout = () => {
  // 先清除本地存儲
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 再清除狀態
  setUser(null);
  setIsAuthenticated(false);
  
  // 嘗試發送登出請求，但不依賴其成功
  try {
    AuthService.logout();
  } catch (error) {
    console.error('發送登出請求失敗，已在本地登出', error);
  }
  
  console.log('用戶已登出，認證狀態已清除');
};
```

### 5. 優化購物車處理邏輯

在 ConcertDetailPage 組件中改進 handleAddToCart 和 handleBuyNow 函數：

```javascript
// 處理加入購物車
const handleAddToCart = () => {
  if (!selectedSeatingArea) return;

  // 清楚檢查用戶登入狀態
  const currentUser = authService.getCurrentUser();
  const isTokenValid = authService.isTokenValid();
  
  // 如果本地存儲中有 token但不正確，先清除
  if (localStorage.getItem('token') && (!currentUser || !isTokenValid)) {
    console.log('重置狀態：發現令牌有問題');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 檢查用戶是否已登入並且令牌有效
  if (!currentUser || !isTokenValid) {
    // 處理未登入情況...
  }
  // 處理已登入情況...
};
```

## Web Storage 說明

### Local Storage 的生命週期

Local Storage 是瀏覽器提供的一種持久化數據存儲機制：

- **持久性存儲**：數據會持久保存，不會隨著頁面刷新或瀏覽器關閉而消失
- **無過期時間**：除非被明確刪除，否則會一直保存
- **域名隔離**：遵循同源政策，只能被來自同一個域名的頁面訪問
- **容量限制**：大多數瀏覽器提供約 5-10MB 的空間

數據會在以下情況下被移除：
- 手動刪除(`localStorage.removeItem()`)
- 用戶清除瀏覽數據
- 隱私模式瀏覽結束時

### Local Storage 與 Session Storage 比較

| 特性 | Local Storage | Session Storage |
|------|--------------|-----------------|
| 生命週期 | 永久，除非手動刪除 | 僅限當前瀏覽器視窗或標籤的會話 |
| 頁面刷新 | 數據保留 | 數據保留 |
| 關閉標籤/視窗 | 數據保留 | 數據被清除 |
| 適用場景 | 長期保存的用戶設定，登入令牌 | 單次會話的臨時數據 |
| 容量 | 約 5-10MB | 約 5-10MB |
| 作用域 | 同源(域名) | 同源+同一標籤頁 |

## 測試方案

要測試修復效果，可遵循以下步驟：

1. **啟動應用程式**
   ```bash
   cd /Users/alanp/digital-concert-hall
   ./start.sh
   ```

2. **測試「立即購票」按鈕**
   - 確認能正確導向到票券購買頁面

3. **測試身份驗證及購物車功能**
   - 登入系統
   - 嘗試添加商品到購物車和立即購買
   - 確認不再提示需要登入

4. **測試登出和重新登入**
   - 確認權限狀態正確變化

5. **測試頁面重載**
   - 登入後刷新頁面，確認登入狀態保持

## 結論

這些修改解決了路由配置和身份驗證狀態管理的問題，使用戶能夠正常完成購票流程。主要改進在於更嚴格的令牌管理、更直接的 localStorage 操作，以及更可靠的認證狀態檢查。
