#!/bin/bash

echo "=== 數位音樂廳認證問題調試腳本 ==="
echo "此腳本會重新啟動前端服務並清除舊的登入狀態"

# 確保腳本可執行
chmod +x auth-debugging.sh

# 檢查是否有 node 進程在運行前端
echo "正在檢查運行中的前端進程..."
FRONTEND_PID=$(lsof -i :3000 | grep node | awk '{print $2}')

if [ ! -z "$FRONTEND_PID" ]; then
  echo "找到運行在端口 3000 的前端進程 (PID: $FRONTEND_PID)，正在停止..."
  kill -9 $FRONTEND_PID
  echo "前端進程已停止"
fi

# 清除瀏覽器緩存
echo "建議您在瀏覽器中執行以下操作："
echo "1. 打開開發者工具 (F12 或右鍵 -> 檢查)"
echo "2. 切換到 Application 標籤"
echo "3. 在左側找到 Storage -> Local Storage -> http://localhost:3000"
echo "4. 右鍵點擊並選擇 'Clear'"
echo "5. 重新載入頁面"

echo "或者完全清除瀏覽器緩存並重新開啟瀏覽器"

# 啟動前端應用
echo "正在啟動前端應用..."
cd /Users/alanp/digital-concert-hall/frontend-client
npm start &

echo "============================="
echo "調試步驟："
echo "1. 打開瀏覽器並訪問 http://localhost:3000"
echo "2. 嘗試註冊或登入"
echo "3. 如果出現 401 錯誤，請檢查控制台日誌中的錯誤信息"
echo "4. 通過開發者工具檢查認證請求和響應："
echo "   - Network 標籤查看 API 請求 (特別關注 /api/auth/signin 請求)"
echo "   - Console 標籤查看前端日誌輸出"
echo "============================="

echo "腳本已完成，前端正在啟動中..."
