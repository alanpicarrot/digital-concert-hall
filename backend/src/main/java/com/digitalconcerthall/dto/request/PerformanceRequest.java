package com.digitalconcerthall.dto.request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceRequest {
    private Long concertId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private String status;  // scheduled, live, completed, cancelled
    private String livestreamUrl;
    private String recordingUrl;
    private Integer duration; // 時長（分鐘）
}
