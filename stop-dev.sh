#!/bin/bash
echo "正在停止所有服務..."
pkill -f 'spring-boot:run'
pkill -f 'npm start'
rm .backend.pid .frontend-client.pid .frontend-admin.pid 2>/dev/null
echo "服務已停止"