#!/bin/bash
echo "正在清除緩存和重啟應用程式..."

# 停止任何可能執行中的 Node 進程
echo "停止可能在運行的 Node 進程..."
pkill -f node || true

# 清除各種緩存
echo "清除 npm 緩存..."
npm cache clean --force

echo "清除 node_modules/.cache 目錄..."
rm -rf node_modules/.cache

# 刪除构建產物
echo "刪除構建產物..."
rm -rf build

# 運行應用程式，使用不同的端口避免衝突
echo "重新啟動應用程式..."
PORT=3002 npm start
