#!/bin/bash
echo "啟動修復後的前端管理應用程式..."
echo "確保後端服務已經啟動!"

# 設置環境變數
export PORT=3001
export DANGEROUSLY_DISABLE_HOST_CHECK=true

# 啟動應用
echo "啟動應用在端口 3001..."
npm start
