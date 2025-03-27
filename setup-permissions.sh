#!/bin/bash
# 數位音樂廳專案 - 權限設置腳本
# 版本: 1.0.0
# 授權方式: 755 (chmod 755 setup-permissions.sh)

# 設置開發腳本的執行權限
echo "設置腳本執行權限..."
chmod 755 start-dev.sh stop-dev.sh

echo "權限設置完成。現在可以直接執行以下命令："
echo "  ./start-dev.sh - 啟動所有服務"
echo "  ./stop-dev.sh  - 停止所有服務"
