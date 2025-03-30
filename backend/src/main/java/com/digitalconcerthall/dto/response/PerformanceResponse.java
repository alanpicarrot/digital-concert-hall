package com.digitalconcerthall.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 演出場次響應數據傳輸對象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceResponse {
    
    private Long id;
    private Long concertId;
    private String concertTitle;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    private String venue;
    private String status;
    private String livestreamUrl;
    private String recordingUrl;
    
    // 演出時長（分鐘）
    private Integer duration;
    
    // 添加格式化時間字符串，便於前端直接使用
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime performanceDateTime; // 為了保持與前端現有代碼兼容
}
