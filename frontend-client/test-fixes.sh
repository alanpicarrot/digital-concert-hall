#!/bin/bash

# 數位音樂廳前台測試腳本
# 用於測試修復後的 Bug

echo "===== 數位音樂廳前台測試腳本 ====="
echo "此腳本將啟動前台應用並提供測試步驟"
echo ""

# 確認用戶準備好開始測試
read -p "按 Enter 鍵開始測試..."

# 檢查是否有其他 React 開發服務器運行
RUNNING_PORT=$(lsof -i :3000 -t)
if [ -n "$RUNNING_PORT" ]; then
  echo "警告: 端口 3000 已被占用，嘗試停止現有進程..."
  kill -9 $RUNNING_PORT
  sleep 2
fi

# 顯示測試說明
echo ""
echo "===== 測試說明 ====="
echo "1. 結帳流程重複登入問題"
echo "   - 使用測試帳號登入: user1 / password123"
echo "   - 將任意票券加入購物車"
echo "   - 進入購物車頁面並點擊「前往結帳」按鈕" 
echo "   - 確認能直接進入結帳頁面而不是重複被導向登入頁"
echo ""
echo "2. 音樂會時間過濾功能"
echo "   - 前往音樂會列表頁"
echo "   - 選擇「即將上演」過濾條件"
echo "   - 確認未來日期的音樂會能正確顯示"
echo ""
echo "3. 票券狀態問題 (未修復，需要管理後台)"
echo "   - 需要在管理後台 (localhost:3001) 測試"
echo ""

# 確認用戶準備好運行應用
read -p "準備啟動應用 (y/n)? " ANSWER

if [ "$ANSWER" != "y" ]; then
  echo "測試取消"
  exit 0
fi

# 設置環境變數並啟動應用
echo "啟動前台應用 (localhost:3000)..."
export REACT_APP_API_URL=http://localhost:8080
export REACT_APP_DEBUG_MODE=true

# 檢查 npm 是否運行正常
if ! npm --version > /dev/null 2>&1; then
  echo "錯誤: npm 命令無法運行，請確保 Node.js 環境正確設置"
  exit 1
fi

# 啟動應用
npm start
