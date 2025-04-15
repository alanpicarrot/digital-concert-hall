# 前後端整合說明文件

## 概述

本文檔說明如何整合演出票券系統的前後端，主要涉及到票券API的調整和前端適配。

## 後端變更

1. 新增了 `ClientTicketController` 以處理前端客戶端的票券相關請求：
   - `GET /api/performances/{performanceId}/tickets` - 根據演出場次ID獲取可用票券
   - `GET /api/tickets/{ticketId}` - 獲取特定票券詳情
   - `GET /api/ticket-types` - 獲取所有票種

2. 新增了 `TicketTypeClientResponse` DTO用於返回適合前端顯示的票券資訊。

## 前端變更

1. 更新了票券服務 (`ticketService.js`)：
   - 修改了 `getTicketsByPerformance` 方法，增加了API返回數據的格式轉換
   - 修改了 `getTicketById` 方法，處理新的API數據結構

2. 更新了票券購買頁面 (`PerformanceTicketsPage.jsx`)：
   - 增強了數據獲取邏輯，處理API返回的新格式
   - 改進了票券展示部分，適配新的數據結構
   - 增加了數據處理邏輯，確保票券顯示所需的所有資訊都可用

## 整合後的數據流

1. 用戶訪問票券頁面 (/tickets/performance/:id)
2. 前端使用 `ticketService.getPerformanceById` 獲取演出詳情
3. 前端使用 `concertService.getConcertById` 獲取音樂會詳情
4. 前端使用 `ticketService.getTicketsByPerformance` 獲取可購買票券
5. 前端處理並展示相關票券資訊

## 測試方式

1. 確保後端服務已重啟，並成功載入新的控制器
2. 訪問前端票券頁面 (/tickets/performance/1)
3. 驗證票券資訊是否正確顯示
4. 點擊特定票券，確認能夠進入票券詳情頁

## 注意事項

1. 由於API數據結構的變更，前端需要處理兩種可能的數據格式，以確保向後兼容
2. 部分票券詳情信息需要從演出場次API中獲取，確保相關API調用正確
3. 如果遇到數據格式問題，請查看瀏覽器控制台的錯誤信息

## 改進建議

1. 後續可考慮統一API返回格式，確保前後端數據結構一致
2. 可以進一步優化數據加載過程，減少API調用次數
3. 考慮添加錯誤處理和重試機制，提高系統穩定性
