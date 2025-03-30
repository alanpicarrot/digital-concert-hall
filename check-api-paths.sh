#!/bin/bash

# 運行 API 路徑檢查工具
echo "運行 API 路徑檢查工具..."
node tools/check-api-paths.js

# 如果要加入到 Git pre-commit hook 中，可以將此腳本添加到 .git/hooks/pre-commit
# 並確保給予執行權限 chmod +x .git/hooks/pre-commit
