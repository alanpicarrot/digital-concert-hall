# 綠界金流整合測試計劃

## 測試環境準備

1. 確認測試環境中已啟用模擬模式
   - 在 `application.properties` 中確認 `ecpay.test.mode=true`
   - 這樣會使用內部模擬的綠界支付頁面，而不是真正連接綠界

2. 確認前後端服務都已啟動
   - 後端 Java 服務已運行
   - 前端 React 應用已運行並能夠連接後端 API

## 測試流程

### 1. 選擇演出並加入票券到購物車

1. 訪問首頁
   - 打開瀏覽器，進入應用首頁

2. 瀏覽演出頁面
   - 點擊導航欄中的「音樂會」或相關選項
   - 或直接訪問 `/concert` 頁面

3. 選擇特定演出
   - 從列表中選擇任意一個演出（例如「莫札特鋼琴協奏曲之夜」）
   - 點擊演出卡片進入詳情頁
   - 或直接訪問 `/concert/1` 頁面（ID 根據實際情況可能有所不同）

4. 選擇票券
   - 在詳情頁面右側的「選擇票券」區域
   - 點擊「+」按鈕來增加任一票券類型的數量（例如選擇 2 張 VIP 席）
   - 觀察總金額的變化，確認計算正確

5. 加入購物車
   - 選好票券後，點擊「加入購物車」按鈕
   - 應該會看到「已成功加入購物車」的提示訊息

### 2. 查看購物車並結帳

1. 進入購物車頁面
   - 點擊頁面頂部導航欄中的購物車圖標
   - 或直接訪問 `/cart` 頁面

2. 確認購物車內容
   - 檢查剛才加入的票券是否顯示在購物車中
   - 確認票券名稱、數量、單價和小計都正確顯示
   - 檢查頁面底部的總金額是否匹配預期

3. 調整購物車（可選）
   - 可以使用「+」和「-」按鈕調整票券數量
   - 或點擊刪除圖標移除不需要的票券
   - 確認金額會相應更新

4. 前往結帳
   - 點擊「前往結帳」按鈕
   - 如果未登入，系統應該會導向登入頁面
   - 登入後，系統應該會自動創建訂單並導向到結帳頁面

### 3. 完成訂單並支付

1. 確認訂單詳情
   - 在結帳頁面，確認顯示的訂單摘要是否正確
   - 檢查訂單編號、訂單日期、狀態是否正確
   - 檢查訂購項目、數量、價格是否正確
   - 確認總金額是否正確

2. 確認付款方式
   - 確認「信用卡支付」選項已被選中（目前只有這一種選項）

3. 確認付款
   - 點擊頁面底部的「確認付款」按鈕
   - 觀察系統是否顯示處理中的狀態

### 4. 測試模式支付頁面

1. 測試支付頁面
   - 點擊「確認付款」後，系統應該會打開一個模擬的綠界支付頁面
   - 確認頁面顯示的訂單編號、商品名稱和金額是否正確

2. 模擬成功支付
   - 點擊「確認付款」按鈕
   - 系統會處理支付請求，然後導向到支付結果頁面

3. 模擬取消支付（另一種情況測試）
   - 在另一次測試中，可以點擊「取消支付」按鈕
   - 系統應該會顯示支付失敗的結果頁面

### 5. 查看支付結果

1. 成功支付結果頁
   - 成功支付後，應該會看到帶有綠色對勾的成功頁面
   - 確認頁面顯示的訂單編號、狀態和金額是否正確
   - 系統應該會在 5 秒後自動跳轉到訂單詳情頁
   - 或可以點擊「查看訂單」按鈕手動跳轉

2. 失敗支付結果頁（如果之前選擇取消支付）
   - 如果取消支付，應該會看到帶有紅色 X 的失敗頁面
   - 確認頁面顯示的錯誤訊息
   - 可以點擊「返回購物車」或「重新嘗試」按鈕

### 6. 檢查訂單狀態

1. 訪問訂單詳情頁
   - 支付成功後，系統會自動跳轉到訂單詳情頁
   - 或可以從用戶中心進入，訪問 `/user/orders/[訂單編號]`

2. 確認訂單狀態
   - 檢查訂單狀態是否已更新為「已付款」
   - 確認票券是否已成功生成（應該顯示票券詳情或下載選項）

## 額外測試項目

### 1. 測試訂單重複支付

1. 嘗試重複支付
   - 對於已支付成功的訂單，嘗試再次訪問結帳頁面
   - 系統應該會檢測到訂單已支付，直接跳轉到訂單詳情頁

### 2. 測試支付API

1. 測試管理員API
   - 使用管理員帳號登入
   - 訪問 `/api/payment/ecpay/test-notify?orderNumber=[訂單編號]&success=true`
   - 確認訂單狀態是否更新

## 問題排查指南

如果測試過程中遇到問題，可以參考以下排查步驟：

1. 檢查網絡請求
   - 使用瀏覽器開發者工具查看網絡請求
   - 確認 API 調用是否成功，查看響應狀態和內容

2. 檢查控制台錯誤
   - 查看瀏覽器控制台是否有 JavaScript 錯誤
   - 查看後端日誌是否有異常

3. 檢查配置是否正確
   - 確認 `application.properties` 中的配置是否正確
   - 確認 `ecpay.test.mode=true` 已設置

4. 檢查測試環境
   - 確認前後端服務都正常運行
   - 確認用戶已正確登入

## 預期結果

成功完成整個測試流程後，應該能夠：

1. 成功模擬整個購票到支付的流程
2. 訂單狀態正確更新為「已付款」
3. 系統成功生成票券
4. 支付相關的前端頁面顯示正確的訂單和票券信息

這個測試計劃可以幫助確保綠界金流整合功能正常運作，並為將來的生產環境部署做好準備。
