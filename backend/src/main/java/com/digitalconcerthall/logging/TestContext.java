package com.digitalconcerthall.logging;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 測試上下文類，保存測試相關數據
 */
public class TestContext {
    private final String testId;
    private final String testName;
    private final String description;
    private final Instant startTime;
    private Instant endTime;
    private final String tags;
    private boolean success = false;
    private boolean failed = false;
    private String resultMessage;
    private String errorMessage;
    private final List<String> steps = new ArrayList<>();
    private int assertions = 0;
    private int failedAssertions = 0;
    private final Map<String, String> markers = new HashMap<>();
    
    public TestContext(String testId, String testName, String description, Instant startTime, String tags) {
        this.testId = testId;
        this.testName = testName;
        this.description = description;
        this.startTime = startTime;
        this.tags = tags;
    }
    
    public void addStep(String stepName) {
        steps.add(stepName);
    }
    
    public int getStepCount() {
        return steps.size();
    }
    
    public void incrementAssertions() {
        assertions++;
    }
    
    public void incrementFailedAssertions() {
        failedAssertions++;
    }
    
    public long getDurationMillis() {
        if (endTime == null) {
            return 0;
        }
        return endTime.toEpochMilli() - startTime.toEpochMilli();
    }
    
    // Getters and setters
    public String getTestId() { return testId; }
    public String getTestName() { return testName; }
    public String getDescription() { return description; }
    public Instant getStartTime() { return startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public boolean isFailed() { return failed; }
    public void setFailed(boolean failed) { this.failed = failed; }
    public String getResultMessage() { return resultMessage; }
    public void setResultMessage(String resultMessage) { this.resultMessage = resultMessage; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public List<String> getSteps() { return steps; }
    public int getAssertions() { return assertions; }
    public int getFailedAssertions() { return failedAssertions; }
    public String getTags() { return tags; }
    public Map<String, String> getMarkers() { return markers; }
}
