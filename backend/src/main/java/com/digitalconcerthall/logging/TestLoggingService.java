package com.digitalconcerthall.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 為自動化測試提供增強的日誌服務
 * 記錄測試執行情況和結果
 */
@Service
public class TestLoggingService {
    private static final Logger logger = LoggerFactory.getLogger(TestLoggingService.class);
    private static final AtomicLong testSequence = new AtomicLong(0);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    
    private final Map<String, TestContext> activeTests = new HashMap<>();
    
    /**
     * 開始一個測試過程並記錄初始信息
     * 
     * @param testName 測試名稱
     * @param description 測試描述
     * @param tags 標籤數組
     * @return 測試ID
     */
    public String startTest(String testName, String description, String... tags) {
        // 生成唯一的測試ID
        String testId = generateTestId(testName);
        
        // 收集測試標籤
        StringBuilder tagString = new StringBuilder();
        if (tags != null && tags.length > 0) {
            tagString.append("[");
            for (int i = 0; i < tags.length; i++) {
                if (i > 0) tagString.append(", ");
                tagString.append(tags[i]);
            }
            tagString.append("]");
        }
        
        // 創建並存儲測試上下文
        TestContext context = new TestContext(testId, testName, description, Instant.now(), tagString.toString());
        activeTests.put(testId, context);
        
        // 設置MDC以便於在日誌中跟踪此測試
        MDC.put("testId", testId);
        MDC.put("testName", testName);
        
        // 記錄測試啟動信息
        logger.info("\n▶▶▶ TEST STARTED ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶\n" +
                "TEST ID: {}\n" +
                "NAME: {}\n" +
                "DESCRIPTION: {}\n" +
                "TAGS: {}\n" +
                "START TIME: {}\n" +
                "▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶",
                testId, testName, description, tagString, 
                LocalDateTime.now().format(formatter));
        
        return testId;
    }
    
    /**
     * 記錄測試步驟
     * 
     * @param testId 測試ID
     * @param stepName 步驟名稱
     * @param details 步驟詳情
     */
    public void logTestStep(String testId, String stepName, String details) {
        if (!activeTests.containsKey(testId)) {
            logger.warn("Attempting to log step for unknown test ID: {}", testId);
            return;
        }
        
        TestContext context = activeTests.get(testId);
        context.addStep(stepName);
        
        // 設置當前測試上下文
        setTestContext(context);
        
        // 記錄步驟信息
        logger.info("\n→ TEST STEP #{} - {}\n" + 
                "DETAILS: {}", 
                context.getStepCount(), stepName, details);
    }
    
    /**
     * 記錄測試斷言
     * 
     * @param testId 測試ID
     * @param assertion 斷言描述
     * @param actual 實際值
     * @param expected 期望值
     * @param passed 是否通過
     */
    public void logAssertion(String testId, String assertion, Object actual, Object expected, boolean passed) {
        if (!activeTests.containsKey(testId)) {
            logger.warn("Attempting to log assertion for unknown test ID: {}", testId);
            return;
        }
        
        TestContext context = activeTests.get(testId);
        context.incrementAssertions();
        if (!passed) {
            context.incrementFailedAssertions();
        }
        
        // 設置當前測試上下文
        setTestContext(context);
        
        // 根據斷言結果使用不同日誌級別
        if (passed) {
            logger.info("\n✓ ASSERTION PASSED: {}\n" + 
                    "EXPECTED: {}\n" + 
                    "ACTUAL: {}", 
                    assertion, expected, actual);
        } else {
            logger.error("\n❌ ASSERTION FAILED: {}\n" + 
                    "EXPECTED: {}\n" + 
                    "ACTUAL: {}", 
                    assertion, expected, actual);
        }
    }
    
    /**
     * 記錄測試錯誤
     * 
     * @param testId 測試ID
     * @param errorMessage 錯誤信息
     * @param exception 異常對象
     */
    public void logTestError(String testId, String errorMessage, Throwable exception) {
        if (!activeTests.containsKey(testId)) {
            logger.warn("Attempting to log error for unknown test ID: {}", testId);
            return;
        }
        
        TestContext context = activeTests.get(testId);
        context.setFailed(true);
        context.setErrorMessage(errorMessage);
        
        // 設置當前測試上下文
        setTestContext(context);
        
        // 記錄錯誤信息
        logger.error("\n❌ TEST ERROR: {}\n" + 
                "DETAILS: {}", 
                errorMessage, 
                exception != null ? exception.toString() : "No exception details", 
                exception);
    }
    
    /**
     * 結束測試並記錄結果
     * 
     * @param testId 測試ID
     * @param success 是否成功
     * @param message 結果信息
     */
    public void endTest(String testId, boolean success, String message) {
        if (!activeTests.containsKey(testId)) {
            logger.warn("Attempting to end unknown test ID: {}", testId);
            return;
        }
        
        TestContext context = activeTests.get(testId);
        context.setEndTime(Instant.now());
        context.setSuccess(success);
        context.setResultMessage(message);
        
        // 設置當前測試上下文
        setTestContext(context);
        
        // 計算執行時間
        long durationMs = context.getDurationMillis();
        
        // 記錄測試結束信息
        if (success) {
            logger.info("\n✓✓✓ TEST PASSED ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓\n" +
                    "TEST ID: {}\n" +
                    "NAME: {}\n" +
                    "RESULT: SUCCESS\n" +
                    "DURATION: {} ms\n" +
                    "STEPS EXECUTED: {}\n" +
                    "ASSERTIONS: {} passed, {} failed\n" +
                    "MESSAGE: {}\n" +
                    "END TIME: {}\n" +
                    "✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓",
                    testId, context.getTestName(), durationMs, 
                    context.getStepCount(), 
                    context.getAssertions() - context.getFailedAssertions(),
                    context.getFailedAssertions(),
                    message,
                    LocalDateTime.now().format(formatter));
        } else {
            logger.error("\n❌❌❌ TEST FAILED ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n" +
                    "TEST ID: {}\n" +
                    "NAME: {}\n" +
                    "RESULT: FAILED\n" +
                    "DURATION: {} ms\n" +
                    "STEPS EXECUTED: {}\n" +
                    "ASSERTIONS: {} passed, {} failed\n" +
                    "FAILURE REASON: {}\n" +
                    "END TIME: {}\n" +
                    "❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌",
                    testId, context.getTestName(), durationMs, 
                    context.getStepCount(), 
                    context.getAssertions() - context.getFailedAssertions(),
                    context.getFailedAssertions(),
                    message,
                    LocalDateTime.now().format(formatter));
        }
        
        // 清除MDC上下文
        MDC.remove("testId");
        MDC.remove("testName");
        MDC.remove("testStep");
        
        // 從活動測試映射中移除
        activeTests.remove(testId);
        
        // 返回測試報告摘要
        generateTestReport(context);
    }
    
    /**
     * 產生測試報告摘要
     */
    private void generateTestReport(TestContext context) {
        StringBuilder report = new StringBuilder();
        report.append("\n===========================================================\n");
        report.append("TEST EXECUTION REPORT\n");
        report.append("===========================================================\n");
        report.append(String.format("ID:          %s\n", context.getTestId()));
        report.append(String.format("Name:        %s\n", context.getTestName()));
        report.append(String.format("Description: %s\n", context.getDescription()));
        report.append(String.format("Tags:        %s\n", context.getTags()));
        report.append(String.format("Result:      %s\n", context.isSuccess() ? "PASSED" : "FAILED"));
        report.append(String.format("Duration:    %d ms\n", context.getDurationMillis()));
        report.append(String.format("Started:     %s\n", LocalDateTime.ofInstant(context.getStartTime(), ZoneId.systemDefault())));
        report.append(String.format("Ended:       %s\n", context.getEndTime() != null ? LocalDateTime.ofInstant(context.getEndTime(), ZoneId.systemDefault()) : "N/A"));
        report.append(String.format("Steps:       %d\n", context.getStepCount()));
        report.append(String.format("Assertions:  %d total, %d failed\n", 
                context.getAssertions(), context.getFailedAssertions()));
        
        if (!context.isSuccess()) {
            report.append("\nFAILURE DETAILS:\n");
            report.append(String.format("- Message: %s\n", context.getResultMessage()));
            if (context.getErrorMessage() != null) {
                report.append(String.format("- Error:   %s\n", context.getErrorMessage()));
            }
        }
        
        report.append("\nTEST STEPS:\n");
        for (int i = 0; i < context.getSteps().size(); i++) {
            report.append(String.format("%d. %s\n", i+1, context.getSteps().get(i)));
        }
        
        report.append("===========================================================\n");
        
        // 將報告寫入日誌
        logger.info(report.toString());
    }
    
    /**
     * 生成測試ID
     */
    private String generateTestId(String testName) {
        // 生成時間戳加序列號的唯一ID
        String timestamp = LocalDateTime.now().format(formatter);
        long sequence = testSequence.incrementAndGet();
        String simpleName = testName.replaceAll("\\s+", "").replaceAll("[^a-zA-Z0-9]", "");
        if (simpleName.length() > 10) {
            simpleName = simpleName.substring(0, 10);
        }
        return String.format("T%s-%s-%03d", timestamp, simpleName, sequence);
    }
    
    /**
     * 設置測試上下文到MDC
     */
    private void setTestContext(TestContext context) {
        MDC.put("testId", context.getTestId());
        MDC.put("testName", context.getTestName());
        MDC.put("testStep", String.valueOf(context.getStepCount()));
    }
    
    /**
     * 添加自定義測試標記
     */
    public void addTestMarker(String testId, String markerKey, String markerValue) {
        if (!activeTests.containsKey(testId)) {
            logger.warn("Attempting to add marker for unknown test ID: {}", testId);
            return;
        }
        
        TestContext context = activeTests.get(testId);
        context.getMarkers().put(markerKey, markerValue);
        
        // 設置當前測試上下文
        setTestContext(context);
        
        logger.info("Test marker added - {}: {}", markerKey, markerValue);
    }
}
