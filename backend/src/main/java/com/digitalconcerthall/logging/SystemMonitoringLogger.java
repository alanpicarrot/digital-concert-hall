package com.digitalconcerthall.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 系統監控組件
 * 定期記錄系統資源使用情況
 */
@Component
public class SystemMonitoringLogger {

    private static final Logger logger = LoggerFactory.getLogger(SystemMonitoringLogger.class);
    private static final Logger performanceLogger = LoggerFactory.getLogger("PERFORMANCE");

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 每5分鐘記錄一次系統資源使用情況
     */
    @Scheduled(fixedRate = 300000) // 5分鐘 = 300,000 毫秒
    public void logSystemResources() {
        try {
            StringBuilder report = new StringBuilder();
            report.append("================================================================================\n");
            report.append("系統資源監控報告 - ").append(LocalDateTime.now().format(formatter)).append("\n");
            report.append("================================================================================\n");

            // JVM 記憶體資訊
            logMemoryInfo(report);

            // 系統資訊
            logSystemInfo(report);

            // 磁碟空間資訊
            logDiskInfo(report);

            // JVM 運行時間
            logRuntimeInfo(report);

            report.append("================================================================================\n");

            performanceLogger.info(report.toString());

        } catch (Exception e) {
            logger.error("記錄系統資源時發生錯誤", e);
        }
    }

    /**
     * 記錄記憶體使用情況
     */
    private void logMemoryInfo(StringBuilder report) {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        Runtime runtime = Runtime.getRuntime();

        // JVM 記憶體
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        report.append("JVM 記憶體使用情況:\n");
        report.append(String.format("  最大記憶體: %d MB (%.1f GB)\n",
                maxMemory / 1024 / 1024, maxMemory / 1024.0 / 1024.0 / 1024.0));
        report.append(String.format("  總分配記憶體: %d MB\n", totalMemory / 1024 / 1024));
        report.append(String.format("  已使用記憶體: %d MB (%.1f%%)\n",
                usedMemory / 1024 / 1024, (usedMemory * 100.0) / maxMemory));
        report.append(String.format("  可用記憶體: %d MB\n", freeMemory / 1024 / 1024));

        // 堆記憶體詳細資訊
        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
        long heapMax = memoryBean.getHeapMemoryUsage().getMax();
        long nonHeapUsed = memoryBean.getNonHeapMemoryUsage().getUsed();

        report.append(String.format("  堆記憶體使用: %d MB / %d MB (%.1f%%)\n",
                heapUsed / 1024 / 1024, heapMax / 1024 / 1024, (heapUsed * 100.0) / heapMax));
        report.append(String.format("  非堆記憶體使用: %d MB\n", nonHeapUsed / 1024 / 1024));
        report.append("\n");
    }

    /**
     * 記錄系統資訊
     */
    private void logSystemInfo(StringBuilder report) {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();

        report.append("系統資源使用情況:\n");
        report.append(String.format("  可用處理器: %d 核心\n", osBean.getAvailableProcessors()));

        // 嘗試獲取系統負載（某些JVM實現可能不支援）
        try {
            double systemLoad = osBean.getSystemLoadAverage();
            if (systemLoad >= 0) {
                report.append(String.format("  系統平均負載: %.2f\n", systemLoad));
            }
        } catch (Exception e) {
            // 忽略不支援的情況
        }

        // 嘗試獲取更詳細的系統資訊（需要 com.sun.management.OperatingSystemMXBean）
        try {
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                com.sun.management.OperatingSystemMXBean sunOsBean = (com.sun.management.OperatingSystemMXBean) osBean;

                long totalPhysicalMemory = sunOsBean.getTotalMemorySize();
                long freePhysicalMemory = sunOsBean.getFreeMemorySize();
                long usedPhysicalMemory = totalPhysicalMemory - freePhysicalMemory;

                report.append(String.format("  系統總記憶體: %d MB\n", totalPhysicalMemory / 1024 / 1024));
                report.append(String.format("  系統已使用記憶體: %d MB (%.1f%%)\n",
                        usedPhysicalMemory / 1024 / 1024,
                        (usedPhysicalMemory * 100.0) / totalPhysicalMemory));
                report.append(String.format("  系統可用記憶體: %d MB\n", freePhysicalMemory / 1024 / 1024));

                double processCpuLoad = sunOsBean.getCpuLoad();
                double systemCpuLoad = sunOsBean.getSystemCpuLoad();

                if (processCpuLoad >= 0) {
                    report.append(String.format("  程序 CPU 使用率: %.1f%%\n", processCpuLoad * 100));
                }
                if (systemCpuLoad >= 0) {
                    report.append(String.format("  系統 CPU 使用率: %.1f%%\n", systemCpuLoad * 100));
                }
            }
        } catch (Exception e) {
            // 某些環境可能不支援詳細的系統資訊
            logger.debug("無法獲取詳細系統資訊: {}", e.getMessage());
        }

        report.append("\n");
    }

    /**
     * 記錄磁碟空間資訊
     */
    private void logDiskInfo(StringBuilder report) {
        report.append("磁碟空間使用情況:\n");

        // 應用程式根目錄
        File rootPath = new File(".");
        long totalSpace = rootPath.getTotalSpace();
        long freeSpace = rootPath.getFreeSpace();
        long usedSpace = totalSpace - freeSpace;

        report.append(String.format("  應用程式目錄總空間: %d GB\n", totalSpace / 1024 / 1024 / 1024));
        report.append(String.format("  已使用空間: %d GB (%.1f%%)\n",
                usedSpace / 1024 / 1024 / 1024, (usedSpace * 100.0) / totalSpace));
        report.append(String.format("  可用空間: %d GB\n", freeSpace / 1024 / 1024 / 1024));

        // 日誌目錄大小
        File logDir = new File("logs");
        if (logDir.exists()) {
            long logDirSize = calculateDirectorySize(logDir);
            report.append(String.format("  日誌目錄大小: %d MB\n", logDirSize / 1024 / 1024));
        }

        report.append("\n");
    }

    /**
     * 記錄JVM運行時間資訊
     */
    private void logRuntimeInfo(StringBuilder report) {
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();

        long uptimeMs = runtimeBean.getUptime();
        long uptimeSeconds = uptimeMs / 1000;
        long uptimeMinutes = uptimeSeconds / 60;
        long uptimeHours = uptimeMinutes / 60;
        long uptimeDays = uptimeHours / 24;

        report.append("JVM 運行時間資訊:\n");
        report.append(String.format("  啟動時間: %s\n",
                LocalDateTime.now().minusSeconds(uptimeSeconds).format(formatter)));

        if (uptimeDays > 0) {
            report.append(String.format("  運行時間: %d 天 %d 小時 %d 分鐘\n",
                    uptimeDays, uptimeHours % 24, uptimeMinutes % 60));
        } else if (uptimeHours > 0) {
            report.append(String.format("  運行時間: %d 小時 %d 分鐘\n",
                    uptimeHours, uptimeMinutes % 60));
        } else {
            report.append(String.format("  運行時間: %d 分鐘\n", uptimeMinutes));
        }

        // JVM 資訊
        report.append(String.format("  JVM 名稱: %s\n", runtimeBean.getVmName()));
        report.append(String.format("  JVM 版本: %s\n", runtimeBean.getVmVersion()));
        report.append(String.format("  程序 PID: %d\n", ProcessHandle.current().pid()));

        report.append("\n");
    }

    /**
     * 計算目錄大小
     */
    private long calculateDirectorySize(File directory) {
        long size = 0;

        if (directory.isFile()) {
            return directory.length();
        }

        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    size += file.length();
                } else if (file.isDirectory()) {
                    size += calculateDirectorySize(file);
                }
            }
        }

        return size;
    }

    /**
     * 每小時記錄一次詳細的系統健康報告
     */
    @Scheduled(fixedRate = 3600000) // 1小時 = 3,600,000 毫秒
    public void logDetailedHealthReport() {
        try {
            StringBuilder report = new StringBuilder();
            report.append("################################################################################\n");
            report.append("數位音樂廳系統健康詳細報告 - ").append(LocalDateTime.now().format(formatter)).append("\n");
            report.append("################################################################################\n");

            // 基本系統資訊
            logMemoryInfo(report);
            logSystemInfo(report);
            logDiskInfo(report);
            logRuntimeInfo(report);

            // 垃圾回收資訊
            logGarbageCollectionInfo(report);

            // 線程資訊
            logThreadInfo(report);

            report.append("################################################################################\n");

            performanceLogger.info(report.toString());

        } catch (Exception e) {
            logger.error("記錄詳細健康報告時發生錯誤", e);
        }
    }

    /**
     * 記錄垃圾回收資訊
     */
    private void logGarbageCollectionInfo(StringBuilder report) {
        report.append("垃圾回收資訊:\n");

        ManagementFactory.getGarbageCollectorMXBeans().forEach(gcBean -> {
            report.append(String.format("  %s: 回收次數 %d, 總時間 %d ms\n",
                    gcBean.getName(), gcBean.getCollectionCount(), gcBean.getCollectionTime()));
        });

        report.append("\n");
    }

    /**
     * 記錄線程資訊
     */
    private void logThreadInfo(StringBuilder report) {
        java.lang.management.ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();

        report.append("線程資訊:\n");
        report.append(String.format("  當前線程數: %d\n", threadBean.getThreadCount()));
        report.append(String.format("  峰值線程數: %d\n", threadBean.getPeakThreadCount()));
        report.append(String.format("  守護線程數: %d\n", threadBean.getDaemonThreadCount()));
        report.append(String.format("  總啟動線程數: %d\n", threadBean.getTotalStartedThreadCount()));

        report.append("\n");
    }
}
