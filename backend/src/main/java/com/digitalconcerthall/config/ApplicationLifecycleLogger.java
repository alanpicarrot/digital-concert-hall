package com.digitalconcerthall.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.boot.context.event.ApplicationStartingEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 應用程式啟動和關閉事件監聽器
 * 記錄詳細的啟動時間、系統資訊等
 */
@Component
@Order(1) // 確保優先執行
public class ApplicationLifecycleLogger {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationLifecycleLogger.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final DateTimeFormatter FILE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final AtomicReference<LocalDateTime> startTime = new AtomicReference<>();
    private final AtomicReference<LocalDateTime> readyTime = new AtomicReference<>();
    private String logFileName;

    /**
     * 應用程式開始啟動時觸發
     */
    @Component
    public static class ApplicationStartingListener implements ApplicationListener<ApplicationStartingEvent> {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationStartingListener.class);

        @Override
        public void onApplicationEvent(@NonNull ApplicationStartingEvent event) {
            LocalDateTime now = LocalDateTime.now();

            // 設置MDC中的啟動時間，用於日誌檔名
            String timestamp = now.format(FILE_FORMATTER);
            MDC.put("startupTime", timestamp);

            // 創建啟動日誌目錄
            File logDir = new File("logs/startup");
            if (!logDir.exists()) {
                logDir.mkdirs();
            }

            logger.info("================================================================================");
            logger.info("數位音樂廳後端服務開始啟動");
            logger.info("啟動時間: {}", now.format(FORMATTER));
            logger.info("================================================================================");

            // 記錄系統資訊
            logSystemInfo();
        }

        private void logSystemInfo() {
            Runtime runtime = Runtime.getRuntime();

            logger.info("系統資訊:");
            logger.info("  Java版本: {}", System.getProperty("java.version"));
            logger.info("  Java廠商: {}", System.getProperty("java.vendor"));
            logger.info("  JVM名稱: {}", System.getProperty("java.vm.name"));
            logger.info("  作業系統: {} {}", System.getProperty("os.name"), System.getProperty("os.version"));
            logger.info("  系統架構: {}", System.getProperty("os.arch"));
            logger.info("  可用處理器: {} 核心", runtime.availableProcessors());
            logger.info("  最大記憶體: {} MB", runtime.maxMemory() / 1024 / 1024);
            logger.info("  已分配記憶體: {} MB", runtime.totalMemory() / 1024 / 1024);
            logger.info("  可用記憶體: {} MB", runtime.freeMemory() / 1024 / 1024);
            logger.info("  工作目錄: {}", System.getProperty("user.dir"));
            logger.info("  時區: {}", System.getProperty("user.timezone"));

            // 記錄環境變數
            String profile = System.getProperty("spring.profiles.active");
            if (profile != null) {
                logger.info("  Spring Profile: {}", profile);
            }

            String port = System.getProperty("server.port");
            if (port != null) {
                logger.info("  服務埠號: {}", port);
            }
        }
    }

    /**
     * 應用程式啟動完成時觸發
     */
    @Component
    public static class ApplicationStartedListener implements ApplicationListener<ApplicationStartedEvent> {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationStartedListener.class);

        @Override
        public void onApplicationEvent(@NonNull ApplicationStartedEvent event) {
            LocalDateTime now = LocalDateTime.now();

            logger.info("================================================================================");
            logger.info("Spring Boot 應用程式啟動完成");
            logger.info("啟動完成時間: {}", now.format(FORMATTER));
            logger.info("================================================================================");

            // 記錄已載入的Bean數量
            String[] beanNames = event.getApplicationContext().getBeanDefinitionNames();
            logger.info("已載入 {} 個 Spring Bean", beanNames.length);

            // 記錄活躍的Profile
            String[] activeProfiles = event.getApplicationContext().getEnvironment().getActiveProfiles();
            if (activeProfiles.length > 0) {
                logger.info("活躍的 Profile: {}", String.join(", ", activeProfiles));
            }
        }
    }

    /**
     * 應用程式完全就緒時觸發
     */
    @Component
    public static class ApplicationReadyListener implements ApplicationListener<ApplicationReadyEvent> {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationReadyListener.class);

        @Override
        public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
            LocalDateTime now = LocalDateTime.now();

            // 計算總啟動時間（需要從MDC或其他方式獲取啟動時間）
            String startupTimeStr = MDC.get("startupTime");
            if (startupTimeStr != null) {
                try {
                    LocalDateTime startupTime = LocalDateTime.parse(startupTimeStr + "00",
                            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmssSSS"));
                    Duration duration = Duration.between(startupTime, now);

                    logger.info("================================================================================");
                    logger.info("數位音樂廳後端服務完全就緒");
                    logger.info("就緒時間: {}", now.format(FORMATTER));
                    logger.info("總啟動時間: {} 毫秒 ({} 秒)", duration.toMillis(), duration.toMillis() / 1000.0);
                    logger.info("================================================================================");
                } catch (Exception e) {
                    logger.warn("無法計算啟動時間: {}", e.getMessage());
                }
            }

            // 記錄服務URL資訊
            try {
                String port = event.getApplicationContext().getEnvironment().getProperty("server.port", "8080");
                logger.info("服務訪問地址:");
                logger.info("  本地訪問: http://localhost:{}", port);
                logger.info("  API文檔: http://localhost:{}/swagger-ui.html", port);
                logger.info("  H2控制台: http://localhost:{}/h2-console", port);
                logger.info("  健康檢查: http://localhost:{}/actuator/health", port);
            } catch (Exception e) {
                logger.warn("無法獲取服務訪問資訊: {}", e.getMessage());
            }

            // 記錄記憶體使用情況
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            logger.info("啟動後記憶體使用情況:");
            logger.info("  已使用記憶體: {} MB", usedMemory / 1024 / 1024);
            logger.info("  可用記憶體: {} MB", runtime.freeMemory() / 1024 / 1024);
            logger.info("  總分配記憶體: {} MB", runtime.totalMemory() / 1024 / 1024);

            // 創建啟動成功標記檔案
            createStartupMarkerFile();
        }

        private void createStartupMarkerFile() {
            try {
                String timestamp = LocalDateTime.now().format(FILE_FORMATTER);
                File markerFile = new File("logs/startup/startup_success_" + timestamp + ".marker");

                try (FileWriter writer = new FileWriter(markerFile)) {
                    writer.write("數位音樂廳後端服務啟動成功\n");
                    writer.write("啟動時間: " + LocalDateTime.now().format(FORMATTER) + "\n");
                    writer.write("PID: " + ProcessHandle.current().pid() + "\n");
                }

                logger.debug("已創建啟動成功標記檔案: {}", markerFile.getAbsolutePath());
            } catch (IOException e) {
                logger.warn("無法創建啟動標記檔案: {}", e.getMessage());
            }
        }
    }

    /**
     * 應用程式關閉時觸發
     */
    @Component
    public static class ApplicationShutdownListener implements ApplicationListener<ContextClosedEvent> {
        private static final Logger logger = LoggerFactory.getLogger(ApplicationShutdownListener.class);

        @Override
        public void onApplicationEvent(@NonNull ContextClosedEvent event) {
            LocalDateTime now = LocalDateTime.now();

            logger.info("================================================================================");
            logger.info("數位音樂廳後端服務開始關閉");
            logger.info("關閉時間: {}", now.format(FORMATTER));
            logger.info("================================================================================");

            // 記錄關閉時的記憶體使用情況
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            logger.info("關閉前記憶體使用情況:");
            logger.info("  已使用記憶體: {} MB", usedMemory / 1024 / 1024);
            logger.info("  可用記憶體: {} MB", runtime.freeMemory() / 1024 / 1024);

            // 創建關閉標記檔案
            createShutdownMarkerFile();

            // 清理MDC
            MDC.clear();

            logger.info("數位音樂廳後端服務關閉完成");
            logger.info("================================================================================");
        }

        private void createShutdownMarkerFile() {
            try {
                String timestamp = LocalDateTime.now().format(FILE_FORMATTER);
                File markerFile = new File("logs/startup/shutdown_" + timestamp + ".marker");

                try (FileWriter writer = new FileWriter(markerFile)) {
                    writer.write("數位音樂廳後端服務正常關閉\n");
                    writer.write("關閉時間: " + LocalDateTime.now().format(FORMATTER) + "\n");
                    writer.write("PID: " + ProcessHandle.current().pid() + "\n");
                }

                logger.debug("已創建關閉標記檔案: {}", markerFile.getAbsolutePath());
            } catch (IOException e) {
                logger.warn("無法創建關閉標記檔案: {}", e.getMessage());
            }
        }
    }
}
