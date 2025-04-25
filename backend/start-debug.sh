#!/bin/bash
echo "正在啟動數位音樂廳後端服務（除錯模式）..."

# 設置環境變數
export SPRING_PROFILES_ACTIVE=dev

# 設置日誌級別
export LOGGING_LEVEL_ROOT=INFO
export LOGGING_LEVEL_COM_DIGITALCONCERTHALL=DEBUG
export LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=DEBUG
export LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_WEB=DEBUG

# 清除可能造成問題的臨時文件
echo "清除臨時文件..."
rm -rf logs/*.log*

# 設置資料庫檔案權限
echo "檢查資料庫目錄權限..."
if [ -d "./db" ]; then
    chmod -R 755 ./db
    echo "已設置資料庫目錄權限"
fi

# 確保使用 Java 17
echo "檢查 Java 版本..."
java -version

# 使用 Maven 啟動應用程式，啟用除錯模式
echo "使用 Maven 啟動應用程式..."
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -Dlogging.level.org.springframework.security=DEBUG -Dlogging.level.com.digitalconcerthall=DEBUG"

# 如果啟動失敗，輸出錯誤訊息
if [ $? -ne 0 ]; then
    echo "應用程式啟動失敗，請檢查錯誤訊息！"
    exit 1
fi

echo "應用程式已成功啟動！"
