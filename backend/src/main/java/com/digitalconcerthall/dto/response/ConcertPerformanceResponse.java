package com.digitalconcerthall.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConcertPerformanceResponse {
    private Long id;
    private String title;
    private String description;
    private String programDetails;
    private String posterUrl;
    private String brochureUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PerformanceInfo> performances;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PerformanceInfo {
        private Long id;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String venue;
        private String status;
        private Integer duration; // 時長（分鐘）
    }
}
