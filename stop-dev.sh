#!/bin/bash
# 數位音樂廳專案 - 停止腳本
# 版本: 1.1.0
# 授權方式: 755 (chmod 755 stop-dev.sh)

echo "停止所有開發服務..."

# 停止 3000 端口
echo "停止用戶前台 (端口 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "用戶前台未運行或已停止"

# 停止 3001 端口
echo "停止管理員後台 (端口 3001)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "管理員後台未運行或已停止"

# 停止後端服務（通常在 8080 端口）
echo "停止後端服務 (端口 8080)..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "後端服務未運行或已停止"

# 確保所有 Node.js 和 Java 相關進程都已停止
echo "確保所有相關進程均已停止..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "spring-boot:run" 2>/dev/null

# 清理 PID 文件
rm -f .backend.pid .frontend-client.pid .frontend-admin.pid 2>/dev/null

echo "所有服務已停止"