#!/bin/bash

# 顯示提示訊息
echo "停止數位音樂廳服務..."

# 停止前端客戶端進程
if [ -f .frontend-client.pid ]; then
    CLIENT_PID=$(cat .frontend-client.pid)
    echo "停止前端客戶端進程 (PID: $CLIENT_PID)..."
    kill -9 $CLIENT_PID 2>/dev/null || true
    rm .frontend-client.pid
fi

# 停止管理後台進程
if [ -f .frontend-admin.pid ]; then
    ADMIN_PID=$(cat .frontend-admin.pid)
    echo "停止管理後台進程 (PID: $ADMIN_PID)..."
    kill -9 $ADMIN_PID 2>/dev/null || true
    rm .frontend-admin.pid
fi

# 停止後端進程
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "停止後端進程 (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null || true
    rm .backend.pid
fi

# 確保所有相關端口的進程都被停止
echo "確保所有相關端口的進程都被停止..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "所有服務已停止"
