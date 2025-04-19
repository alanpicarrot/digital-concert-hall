#!/bin/bash
# 測試 API 連接的腳本

echo "===== 測試後端 API 連接 ====="
echo "時間: $(date)"
echo ""

# 設定後端 API 端口
BACKEND_PORT=8080
echo "檢測後端 API 端口: $BACKEND_PORT"

# 檢查後端服務是否運行
echo "嘗試連接到後端服務..."
if curl -s --head "http://localhost:$BACKEND_PORT" > /dev/null; then
  echo "✅ 成功: 後端服務正在運行於端口 $BACKEND_PORT"
else
  echo "❌ 錯誤: 無法連接到 http://localhost:$BACKEND_PORT"
  echo "請確認後端服務已啟動並運行在正確的端口上"
  exit 1
fi

# 測試音樂會 API
echo ""
echo "測試 /api/concerts 端點..."
CONCERTS_API_RESPONSE=$(curl -s "http://localhost:$BACKEND_PORT/api/concerts")

if [[ "$CONCERTS_API_RESPONSE" == *"[]"* || "$CONCERTS_API_RESPONSE" == *"["* ]]; then
  echo "✅ 成功: 音樂會 API 返回了有效的 JSON 數據"
  # 檢查是否返回了空數組
  if [[ "$CONCERTS_API_RESPONSE" == "[]" ]]; then
    echo "⚠️ 注意: API 返回了空數組，可能沒有音樂會數據"
  else
    echo "音樂會數據預覽:"
    echo "$CONCERTS_API_RESPONSE" | head -c 300
    echo "..."
  fi
else
  echo "❌ 錯誤: 音樂會 API 沒有返回有效的 JSON 數組數據"
  echo "收到的響應:"
  echo "$CONCERTS_API_RESPONSE" | head -c 300
  echo "..."
fi

# 測試不帶 /api 前綴的路徑
echo ""
echo "測試備用路徑 /concerts 端點..."
CONCERTS_DIRECT_RESPONSE=$(curl -s "http://localhost:$BACKEND_PORT/concerts")

if [[ "$CONCERTS_DIRECT_RESPONSE" == *"["* ]]; then
  echo "✅ 成功: 備用路徑 /concerts 返回了有效的 JSON 數據"
else
  echo "⚠️ 注意: 備用路徑 /concerts 不可用，這可能是正常的，取決於後端 API 設計"
fi

# 測試音樂節 API
echo ""
echo "測試音樂節相關端點..."
curl -s "http://localhost:$BACKEND_PORT/api/festivals" > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ 音樂節 API 端點可能存在"
  FESTIVALS_RESPONSE=$(curl -s "http://localhost:$BACKEND_PORT/api/festivals")
  echo "響應預覽: "
  echo "$FESTIVALS_RESPONSE" | head -c 300
  echo "..."
else
  echo "❌ 音樂節 API 端點不可用"
fi

# 檢查後端 API 結構
echo ""
echo "嘗試獲取 API 路由信息..."
ROUTES_RESPONSE=$(curl -s "http://localhost:$BACKEND_PORT/api")
echo "API 根路徑響應: "
echo "$ROUTES_RESPONSE" | head -c 300
echo "..."

echo ""
echo "===== 測試完成 ====="
echo "如果後端 API 連接有問題，請確認:"
echo "1. 後端服務確實運行在端口 $BACKEND_PORT"
echo "2. API 路徑是否正確 - 確認是否使用 /api 前綴"
echo "3. 確認開發環境的 CORS 配置允許從 localhost:3000 發出的請求"
