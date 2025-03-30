#!/bin/bash

# 備份目錄
BACKUP_DIR="api-paths-backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 備份前端目錄
echo "正在備份前端目錄..."
cp -r frontend-client/src "$BACKUP_DIR/frontend-client-src"
cp -r frontend-admin/src "$BACKUP_DIR/frontend-admin-src"

# 運行 API 路徑修復工具
echo "運行 API 路徑修復工具..."
node tools/migrate-api-paths.js

echo "完成！"
echo "如果需要還原，請使用以下命令："
echo "cp -r $BACKUP_DIR/frontend-client-src/* frontend-client/src/"
echo "cp -r $BACKUP_DIR/frontend-admin-src/* frontend-admin/src/"
