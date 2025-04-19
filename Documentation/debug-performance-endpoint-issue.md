# 數位音樂廳 - API 端點問題排查記錄

## 問題描述

前端在票券頁面（`/tickets/performance/1`）請求演出詳情時，收到 HTTP 500 錯誤。

錯誤詳情：
- 請求路徑：`http://localhost:8080/api/performances/1`
- 響應狀態：500 (Internal Server Error)
- 錯誤訊息：`"No static resource api/performances/1."`

## 問題原因

1. 後端未實現 `/api/performances/{id}` 端點
2. 雖然安全配置已允許訪問此路徑，但缺少對應的控制器
3. 請求被當作靜態資源處理，而非 API 請求

## 解決方案

### 1. 新增表演控制器

建立 `PerformanceController.java` 文件處理公開表演請求：

```java
package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.PerformanceDetailResponse;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.repository.concert.PerformanceRepository;

import java.time.Duration;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/performances")
public class PerformanceController {
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getPerformanceById(@PathVariable("id") Long id) {
        return performanceRepository.findById(id)
                .map(performance -> {
                    PerformanceDetailResponse response = new PerformanceDetailResponse();
                    response.setId(performance.getId());
                    response.setStartTime(performance.getStartTime());
                    response.setEndTime(performance.getEndTime());
                    response.setVenue(performance.getVenue());
                    response.setStatus(performance.getStatus());
                    
                    // 計算演出時長（分鐘）
                    if (performance.getStartTime() != null && performance.getEndTime() != null) {
                        long durationMinutes = Duration.between(
                            performance.getStartTime(), 
                            performance.getEndTime()
                        ).toMinutes();
                        response.setDuration((int) durationMinutes);
                    } else {
                        response.setDuration(120); // 默認值2小時
                    }
                    
                    // 設置關聯的音樂會信息
                    if (performance.getConcert() != null) {
                        response.setConcertId(performance.getConcert().getId());
                        response.setConcertTitle(performance.getConcert().getTitle());
                        response.setConcertDescription(performance.getConcert().getDescription());
                        response.setPosterUrl(performance.getConcert().getPosterUrl());
                    }
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
```

### 2. 添加響應 DTO

創建 `PerformanceDetailResponse.java` 文件：

```java
package com.digitalconcerthall.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class PerformanceDetailResponse {
    
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    private String venue;
    
    private String status;
    
    private Integer duration; // 演出時長（分鐘）
    
    private Long concertId;
    
    private String concertTitle;
    
    private String concertDescription;
    
    private String posterUrl;
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public String getVenue() {
        return venue;
    }
    
    public void setVenue(String venue) {
        this.venue = venue;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public Long getConcertId() {
        return concertId;
    }
    
    public void setConcertId(Long concertId) {
        this.concertId = concertId;
    }
    
    public String getConcertTitle() {
        return concertTitle;
    }
    
    public void setConcertTitle(String concertTitle) {
        this.concertTitle = concertTitle;
    }
    
    public String getConcertDescription() {
        return concertDescription;
    }
    
    public void setConcertDescription(String concertDescription) {
        this.concertDescription = concertDescription;
    }
    
    public String getPosterUrl() {
        return posterUrl;
    }
    
    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }
}
```

## 相關代碼結構

- 后端 Spring Security 配置已允许访问 `/api/performances/**`
- 前端票券頁面通過 Axios 請求 `/api/performances/1` 獲取演出詳情
- 票券相關功能通過 `/api/performances/{performanceId}/tickets` 端點提供，已正常實現

## 測試與驗證

1. 重新部署或重啟後端應用
2. 請求 `/api/performances/1` 端點，確認返回正確響應
3. 在前端票券頁面確認能正確顯示演出信息和相關票券

## 學習要點

1. REST API 設計需完整實現各資源端點
2. 後端錯誤日誌是排查問題的重要線索
3. 注意 Spring 靜態資源處理與 API 路由的區別
4. DTO 需符合前端需求，包含完整且必要的數據
