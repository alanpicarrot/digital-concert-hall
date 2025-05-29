# 數位音樂廳後端完整日誌系統

## 📋 概述

本系統提供了完整的日誌記錄功能，包括：
- 自動啟動時間命名的日誌檔案
- 系統資源監控
- HTTP請求追蹤
- 詳細的應用程式日誌
- 便捷的日誌管理工具

## 🚀 快速開始

### 1. 設置權限
```bash
cd /Users/alanp/digital-concert-hall/backend
chmod +x set-permissions.sh
./set-permissions.sh
```

### 2. 啟動服務（帶完整日誌記錄）
```bash
# 啟動開發環境
./scripts/start-with-logging.sh dev

# 啟動生產環境  
./scripts/start-with-logging.sh prod

# 啟動測試環境
./scripts/start-with-logging.sh test
```

### 3. 查看日誌
```bash
# 查看最新啟動日誌
./scripts/log-manager.sh latest

# 即時監控日誌
./scripts/log-manager.sh tail

# 列出所有日誌檔案
./scripts/log-manager.sh list
```

### 4. 停止服務
```bash
./scripts/stop-service.sh
```

## 📁 日誌結構

```
logs/
├── startup/                          # 啟動相關日誌
│   ├── backend_startup_20241201_143022.log  # 啟動時間命名的日誌
│   ├── startup_success_20241201_143045.marker
│   └── shutdown_20241201_150022.marker
├── backend.log                       # 主要應用程式日誌
├── api.log                          # API請求日誌
├── security.log                     # 安全相關日誌
├── performance.log                  # 效能監控日誌
├── error.log                        # 錯誤日誌
├── test.log                         # 測試日誌
└── archived/                        # 封存的日誌檔案
    ├── backend.2024-12-01.0.log.gz
    └── ...
```

## 🔧 日誌管理工具

### `log-manager.sh` 命令

| 命令 | 說明 | 範例 |
|------|------|------|
| `list` | 列出所有日誌檔案 | `./scripts/log-manager.sh list` |
| `latest` | 查看最新的啟動日誌 | `./scripts/log-manager.sh latest` |
| `tail [檔名]` | 即時監控日誌檔案 | `./scripts/log-manager.sh tail` |
| `view [檔名]` | 查看完整日誌檔案 | `./scripts/log-manager.sh view backend.log` |
| `search [關鍵字]` | 在所有日誌中搜尋 | `./scripts/log-manager.sh search "ERROR"` |
| `errors` | 查看所有錯誤日誌 | `./scripts/log-manager.sh errors` |
| `clean [天數]` | 清理舊日誌檔案 | `./scripts/log-manager.sh clean 30` |
| `status` | 顯示日誌統計資訊 | `./scripts/log-manager.sh status` |
| `archive [天數]` | 封存舊日誌檔案 | `./scripts/log-manager.sh archive 7` |

## 🎯 日誌功能特點

### 1. 啟動時間命名
- 每次啟動服務都會創建以啟動時間命名的日誌檔案
- 格式：`backend_startup_YYYYMMDD_HHMMSS.log`
- 自動記錄啟動和關閉時間

### 2. 系統監控
- 每5分鐘記錄系統資源使用情況
- 每小時生成詳細健康報告
- 監控項目：記憶體、CPU、磁碟空間、線程、垃圾回收

### 3. HTTP請求追蹤
- 每個請求自動分配追蹤ID
- 記錄請求和響應的詳細資訊
- 自動計算處理時間
- 根據狀態碼和處理時間調整日誌級別

### 4. 分類日誌
- **應用程式日誌** (`backend.log`): 主要業務邏輯
- **API日誌** (`api.log`): HTTP請求響應
- **安全日誌** (`security.log`): 認證授權相關
- **效能日誌** (`performance.log`): 系統監控資料
- **錯誤日誌** (`error.log`): 所有錯誤訊息
- **測試日誌** (`test.log`): 測試相關

### 5. 自動輪轉和封存
- 日誌檔案大小達到限制時自動輪轉
- 自動壓縮舊日誌檔案
- 可配置保留天數和總大小限制

## ⚙️ 配置說明

### 日誌配置檔案
- 主配置：`src/main/resources/logback-spring-enhanced.xml`
- 應用配置：`src/main/resources/application.properties`

### 環境特定配置
- **開發環境** (`dev`): DEBUG級別，詳細SQL日誌
- **測試環境** (`test`): DEBUG級別，測試專用日誌
- **生產環境** (`prod`): INFO級別，優化效能

## 🔍 常用日誌查看命令

### 查看最新日誌
```bash
# 查看最新啟動日誌
./scripts/log-manager.sh latest

# 即時監控最新日誌
./scripts/log-manager.sh tail

# 查看特定日誌檔案
./scripts/log-manager.sh view backend_startup_20241201_143022.log
```

### 搜尋和過濾
```bash
# 搜尋錯誤訊息
./scripts/log-manager.sh search "ERROR"

# 搜尋特定用戶的操作
./scripts/log-manager.sh search "userId:123"

# 查看所有錯誤
./scripts/log-manager.sh errors
```

### 清理和維護
```bash
# 查看日誌統計
./scripts/log-manager.sh status

# 清理30天前的日誌
./scripts/log-manager.sh clean 30

# 封存7天前的日誌
./scripts/log-manager.sh archive 7
```

## 🚨 故障排除

### 常見問題

#### 1. 權限問題
```bash
# 如果腳本無法執行
chmod +x ./scripts/*.sh
./set-permissions.sh
```

#### 2. 日誌目錄不存在
```bash
# 手動創建日誌目錄
mkdir -p logs/startup
mkdir -p logs/archived
```

#### 3. 磁碟空間不足
```bash
# 檢查磁碟使用情況
./scripts/log-manager.sh status

# 清理舊日誌
./scripts/log-manager.sh clean 7
```

#### 4. 服務無法停止
```bash
# 檢查進程
ps aux | grep digital-concert-hall

# 強制停止
kill -9 <PID>
```

## 📈 最佳實踐

### 1. 日誌級別使用
- **ERROR**: 系統錯誤、異常情況
- **WARN**: 警告、潛在問題
- **INFO**: 重要業務流程、狀態變更
- **DEBUG**: 除錯資訊、詳細流程
- **TRACE**: 最詳細的追蹤資訊

### 2. 效能考量
- 使用異步Appender提升效能
- 避免在迴圈中記錄DEBUG級別日誌
- 合理設置日誌輪轉和保留策略

### 3. 安全性
- 避免記錄敏感資訊（密碼、token）
- 對敏感資料進行遮罩處理
- 設置適當的日誌檔案權限

### 4. 監控和警報
- 定期檢查日誌檔案大小
- 監控錯誤日誌數量
- 設置磁碟空間警報

---

## 📞 技術支援

如有任何問題或建議，請參考：
1. 查看 `logs/startup/` 目錄下的最新啟動日誌
2. 使用 `./scripts/log-manager.sh errors` 檢查錯誤
3. 運行 `./scripts/log-manager.sh status` 查看系統狀態

**記住**：良好的日誌是除錯和監控的最佳朋友！ 🎯
