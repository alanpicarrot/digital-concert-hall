#!/bin/bash
# 數位音樂廳專案 - 停止腳本
# 版本: 1.0.0
# 授權方式: 755 (chmod 755 stop-dev.sh)

# 檢查是否存在保存的 PID 文件
echo "停止所有開發服務..."

# 使用保存的 PID 文件來停止進程 (如果存在)
if [ -f ".backend.pid" ]; then
    pid=$(cat .backend.pid)
    echo "停止後端服務 (PID: $pid)..."
    kill $pid 2>/dev/null || echo "後端服務未運行或已停止"
    rm .backend.pid
else
    # 嘗試使用進程查找停止後端服務
    pkill -f "spring-boot:run" || echo "未找到運行中的後端服務"
fi

if [ -f ".frontend-client.pid" ]; then
    pid=$(cat .frontend-client.pid)
    echo "停止用戶前台 (PID: $pid)..."
    kill $pid 2>/dev/null || echo "用戶前台未運行或已停止"
    rm .frontend-client.pid
else
    # 嘗試停止前台服務
    pkill -f "PORT=3000 react-scripts start" || echo "未找到運行中的用戶前台"
fi

if [ -f ".frontend-admin.pid" ]; then
    pid=$(cat .frontend-admin.pid)
    echo "停止管理員後台 (PID: $pid)..."
    kill $pid 2>/dev/null || echo "管理員後台未運行或已停止"
    rm .frontend-admin.pid
else
    # 嘗試停止後台服務
    pkill -f "PORT=3001 react-scripts start" || echo "未找到運行中的管理員後台"
fi

# 確保所有 Node.js 和 Java 相關進程都已停止
echo "確保所有相關進程均已停止..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "spring-boot:run" 2>/dev/null

# 清理剩餘的 PID 文件（如果有）
rm -f .backend.pid .frontend-client.pid .frontend-admin.pid 2>/dev/null

echo "所有服務已停止"
