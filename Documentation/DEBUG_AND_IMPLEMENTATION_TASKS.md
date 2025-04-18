# 數位音樂廳系統 - 除錯與實作項目清單

本文檔列出在系統測試中發現的需要除錯和實作的項目，按優先級和系統區域分類。

## 前台系統 (localhost:3000) 問題

### 高優先級

1. **票券展示頁面錯誤** 
   - 問題：在「我的票券」頁面顯示載入錯誤
   - 位置：`/user/tickets`
   - 錯誤訊息：「載入票券時發生錯誤，請稍後再試」
   - 可能原因：後端功能尚未完全實現或數據獲取存在問題

2. **購票頁面與購物車數據不一致**
   - 問題：主頁和音樂會詳情頁顯示仍有票券可購買，但購票區頁面顯示「目前沒有可購買的票券」
   - 位置：`/tickets` 與 `/concerts/1` 頁面
   - 建議：統一不同頁面的票券可用性顯示

3. **購物車價格顯示不一致**
   - 問題：購物車顯示票價為 NT$ 1000，結帳頁面顯示價格為 NT$ 1500
   - 位置：`/cart` 和 `/checkout/{orderNumber}` 頁面
   - 建議：確保價格在整個流程中保持一致

4. **支付系統細節錯誤**
   - 問題：綠界支付頁面商品描述不一致，顯示「test x 1」而非「2張標準票」
   - 位置：`/payment/ecpay` 頁面
   - 建議：正確傳遞訂單明細到支付頁面

### 中優先級

1. **結帳後未重定向到訂單確認頁**
   - 問題：登入後，系統將用戶重定向到首頁而非繼續結帳流程
   - 位置：登入後的重定向邏輯
   - 建議：改進用戶體驗，保持購買流程的連續性

2. **立即購票按鈕功能不完整**
   - 問題：點擊「立即購票」不直接帶到購票頁面
   - 位置：`/concerts/1` 頁面
   - 建議：優化用戶體驗，直接進入選擇票券和數量的界面

### 低優先級

1. **登出後購物車狀態處理**
   - 問題：登出後，購物車內容被清空而非保留
   - 建議：考慮是否要保留匿名用戶的購物車內容

## 後台系統 (localhost:3001) 問題

### 高優先級

1. **用戶管理頁面權限問題**
   - 問題：無法訪問用戶管理頁面，即使使用管理員帳號也會被重定向到登入頁面
   - 位置：`/users` 頁面
   - 建議：修復權限檢查或實現缺失的功能

2. **會話過期處理**
   - 問題：會話過期後沒有友好提示，直接跳轉到登入頁面
   - 建議：增加會話過期提示，並在重新登入後恢復用戶之前的操作

### 中優先級

1. **庫存管理優化**
   - 建議：實現批量修改庫存功能，特別是對於大型音樂會
   - 位置：票券管理頁面

2. **新增票券按鈕的狀態控制**
   - 問題：在選擇音樂會前，新增票券按鈕為禁用狀態，但缺少視覺提示說明原因
   - 位置：`/tickets` 頁面
   - 建議：添加提示信息，說明需要先選擇音樂會才能添加票券

## 通用系統問題

### 高優先級

1. **數據一致性問題**
   - 問題：前台和後台的票券數據顯示有時不同步
   - 建議：優化數據同步機制，確保實時顯示最新的票券狀態

2. **安全性增強**
   - 建議：實現更強的密碼策略和CSRF保護
   - 位置：註冊和登入頁面

### 中優先級

1. **UI/UX改進**
   - 建議：優化移動端響應式設計
   - 建議：改進錯誤提示的用戶友好性

2. **系統文檔完善**
   - 建議：為管理員和開發人員提供更詳細的系統文檔

## 技術債務

1. **代碼重構需求**
   - 建議：重構重複的代碼，特別是票券相關的邏輯

2. **測試覆蓋率**
   - 建議：增加自動化測試覆蓋率，特別是購票流程的端到端測試

## 後續功能建議

1. **電子票券功能完善**
   - 建議：實現電子票券的下載和展示功能
   - 優先級：高

2. **用戶評論和評分系統**
   - 建議：允許用戶對已參加的音樂會進行評論和評分
   - 優先級：中

3. **會員積分系統**
   - 建議：實現會員積分系統，鼓勵用戶重複購票
   - 優先級：中

4. **推薦系統**
   - 建議：基於用戶過去的購票記錄，推薦相關音樂會
   - 優先級：低
