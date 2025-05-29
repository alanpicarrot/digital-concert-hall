#!/bin/bash

# =============================================================================
# 設置腳本權限
# 使用方法：./set-permissions.sh
# =============================================================================

echo "設置腳本可執行權限..."

chmod +x ./scripts/start-with-logging.sh
chmod +x ./scripts/stop-service.sh  
chmod +x ./scripts/log-manager.sh
chmod +x ./set-permissions.sh

echo "權限設置完成！"
echo ""
echo "可用的腳本："
echo "  ./scripts/start-with-logging.sh [profile] - 啟動服務並記錄完整日誌"
echo "  ./scripts/stop-service.sh              - 停止服務"
echo "  ./scripts/log-manager.sh [命令]         - 日誌管理工具"
echo ""
echo "使用範例："
echo "  ./scripts/start-with-logging.sh dev"
echo "  ./scripts/log-manager.sh latest"
echo "  ./scripts/log-manager.sh tail"
