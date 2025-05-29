# 數位音樂廳完整日誌系統 - 檔案總覽

## 📁 已創建的檔案清單

### 🔧 腳本文件 (`scripts/`)
```
scripts/
├── start-with-logging.sh      # 主要啟動腳本（帶完整日誌記錄）
├── stop-service.sh           # 服務停止腳本
├── log-manager.sh           # 綜合日誌管理工具
└── demo-logging-system.sh   # 系統演示腳本
```

### ⚙️ 配置文件
```
src/main/resources/
├── logback-spring-enhanced.xml     # 增強版日誌配置
└── application-logging.properties  # 日誌系統專用配置
```

### 💻 Java組件
```
src/main/java/com/digitalconcerthall/
├── config/
│   └── ApplicationLifecycleLogger.java    # 應用程式生命週期監聽器
└── logging/
    ├── EnhancedHttpLoggingFilter.java     # HTTP請求日誌過濾器
    └── SystemMonitoringLogger.java       # 系統資源監控組件
```

### 📚 文檔文件
```
backend/
├── LOGGING_SYSTEM_README.md    # 完整系統說明文檔
└── set-permissions.sh          # 權限設置腳本
```

## 🚀 快速部署指南

### 1. 初始設置
```bash
cd /Users/alanp/digital-concert-hall/backend

# 設置腳本權限
chmod +x set-permissions.sh
./set-permissions.sh

# 運行系統演示
./scripts/demo-logging-system.sh
```

### 2. 啟動服務
```bash
# 開發環境
./scripts/start-with-logging.sh dev

# 生產環境
./scripts/start-with-logging.sh prod
```

### 3. 日誌管理
```bash
# 查看最新日誌
./scripts/log-manager.sh latest

# 即時監控
./scripts/log-manager.sh tail

# 搜尋錯誤
./scripts/log-manager.sh search "ERROR"
```

## 🎯 核心功能特點

### ✅ 已實現的功能

#### 1. **智能檔名系統**
- ✅ 啟動時間自動命名：`backend_startup_20241201_143022.log`
- ✅ 服務生命週期標記檔案
- ✅ 自動創建日誌目錄結構

#### 2. **完整日誌記錄**
- ✅ 應用程式啟動/關閉完整記錄
- ✅ 系統資源詳細記錄（記憶體、CPU、磁碟）
- ✅ HTTP請求追蹤（包含唯一追蹤ID）
- ✅ 分類日誌存儲（API、安全、效能、錯誤）

#### 3. **自動化監控**
- ✅ 每5分鐘系統資源監控
- ✅ 每小時詳細健康報告
- ✅ JVM垃圾回收統計
- ✅ 線程池監控

#### 4. **高級管理工具**
- ✅ 綜合日誌管理命令行工具
- ✅ 日誌搜尋和過濾
- ✅ 自動清理和封存
- ✅ 統計資訊報告

#### 5. **效能優化**
- ✅ 異步日誌寫入
- ✅ 自動日誌輪轉
- ✅ 壓縮封存舊日誌
- ✅ 智能過濾靜態資源請求

### 📊 日誌文件結構
```
logs/
├── startup/                          # 啟動日誌
│   ├── backend_startup_YYYYMMDD_HHMMSS.log
│   ├── startup_success_*.marker
│   └── shutdown_*.marker
├── backend.log                       # 主應用日誌
├── api.log                          # API請求日誌
├── security.log                     # 安全相關日誌
├── performance.log                  # 效能監控日誌
├── error.log                        # 錯誤日誌
├── test.log                         # 測試日誌
└── archived/                        # 封存日誌
    └── *.log.gz
```

## 🔍 使用範例

### 基本操作
```bash
# 啟動開發環境
./scripts/start-with-logging.sh dev

# 在另一個終端監控日誌
./scripts/log-manager.sh tail

# 搜尋特定用戶的操作
./scripts/log-manager.sh search "userId:12345"

# 查看系統狀態
./scripts/log-manager.sh status
```

### 運維維護
```bash
# 清理30天前的日誌
./scripts/log-manager.sh clean 30

# 封存7天前的日誌
./scripts/log-manager.sh archive 7

# 查看錯誤摘要
./scripts/log-manager.sh errors
```

## 🎨 自定義配置

### 修改日誌級別
編輯 `application-logging.properties`：
```properties
# 調整特定包的日誌級別
logging.level.com.digitalconcerthall.controller=INFO
logging.level.com.digitalconcerthall.service=DEBUG
```

### 調整監控頻率
```properties
# 系統資源監控間隔（毫秒）
app.monitoring.system.interval=300000  # 5分鐘

# 詳細健康報告間隔（毫秒）
app.monitoring.health.interval=3600000  # 1小時
```

### 自定義日誌格式
編輯 `logback-spring-enhanced.xml` 中的pattern配置。

## 🛡️ 安全性考量

### ✅ 已實現的安全措施
- 敏感資訊自動遮罩（Authorization header）
- 密碼欄位過濾
- 適當的檔案權限設置
- 日誌檔案大小和數量限制

### 🔒 生產環境建議
```properties
# 生產環境配置
spring.profiles.active=prod
logging.level.com.digitalconcerthall=INFO
management.endpoints.web.exposure.include=health,info,metrics
```

## 📈 效能指標

### 資源使用
- **記憶體影響**: 異步日誌最小化記憶體佔用
- **磁碟使用**: 自動輪轉和壓縮控制空間
- **CPU影響**: 後台監控任務低優先級執行

### 日誌吞吐量
- **異步處理**: 支援高併發日誌寫入
- **智能過濾**: 排除不必要的靜態資源請求
- **批量寫入**: 提升I/O效率

## 🔧 故障排除快速指南

### 常見問題解決
```bash
# 權限問題
chmod +x ./scripts/*.sh

# 日誌目錄問題
mkdir -p logs/startup logs/archived

# 磁碟空間問題
./scripts/log-manager.sh clean 7

# 服務無法停止
ps aux | grep digital-concert-hall
kill -9 <PID>
```

## 🎯 最佳實踐總結

### ✅ 遵循的最佳實踐
1. **結構化日誌**: 統一格式和標準
2. **追蹤性**: 每個請求唯一追蹤ID
3. **分級記錄**: 適當的日誌級別分配
4. **自動化**: 減少手動維護工作
5. **安全性**: 保護敏感資訊
6. **效能**: 異步處理和智能過濾
7. **維護性**: 完整的管理工具

### 🚀 生產環境清單
- [ ] 調整日誌級別為INFO/WARN
- [ ] 限制管理端點暴露
- [ ] 設置適當的日誌保留策略
- [ ] 配置磁碟空間監控警報
- [ ] 建立日誌監控儀表板
- [ ] 設置錯誤日誌通知

---

## 🎉 總結

這個日誌系統為數位音樂廳後端提供了：
- **企業級日誌管理**
- **自動化運維工具**
- **詳細的系統監控**
- **完整的故障排除支援**

系統已經完全可用，只需要運行 `./scripts/demo-logging-system.sh` 開始體驗！

**記住：好的日誌是系統健康的窗口！** 🔍✨
