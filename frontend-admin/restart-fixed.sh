#!/bin/bash
echo "啟動修復後的前端管理應用程式..."

# 停止任何可能執行中的 Node 進程
echo "停止可能在運行的 Node 進程..."
pkill -f "node.*3001" || true

# 清除緩存
echo "清除 node_modules/.cache 目錄..."
rm -rf node_modules/.cache

# 設置環境變數
export PORT=3001
export DANGEROUSLY_DISABLE_HOST_CHECK=true
export FAST_REFRESH=false

# 啟動應用
echo "啟動應用在端口 3001..."
npm start
