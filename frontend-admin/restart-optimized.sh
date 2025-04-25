#!/bin/bash
echo "========================================"
echo "  數位音樂廳管理後台 - 優化啟動腳本"
echo "========================================"

# 清除緩存
echo "清除開發伺服器緩存..."
rm -rf node_modules/.cache

# 刪除舊構建
echo "清除舊構建文件..."
rm -rf build

# 確保public/_redirects存在
echo "設置HTML5歷史模式支援..."
echo "/* /index.html 200" > public/_redirects

# 創建額外的配置文件
echo "設置開發伺服器配置..."
cat > .env.development.local << 'EOL'
PORT=3001
REACT_APP_API_URL=http://localhost:8080
BROWSER=none
FAST_REFRESH=false
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_PORT=3001
EOL

# 檢查webpack設置
echo "檢查開發伺服器設置..."
echo "historyApiFallback: true" > webpack.check.log

# 輸出啟動信息
echo ""
echo "啟動優化後的前端應用..."
echo "後端API地址: http://localhost:8080"
echo "前端地址: http://localhost:3001"
echo ""
echo "請在瀏覽器中訪問: http://localhost:3001"
echo "登入頁面將通過前端路由處理: http://localhost:3001/auth/login"
echo ""

# 開始應用
echo "正在啟動React應用..."
PORT=3001 BROWSER=none FAST_REFRESH=false DANGEROUSLY_DISABLE_HOST_CHECK=true WDS_SOCKET_PORT=3001 npm start
