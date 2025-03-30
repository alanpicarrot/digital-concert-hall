package com.digitalconcerthall.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConcertResponse {
    private Long id;
    private String title;
    private String description;
    private String programDetails;
    private String posterUrl;
    private String brochureUrl;
    private String status;
    private LocalDateTime startTime; // 第一個場次的時間
    private String venue; // 第一個場次的地點
    private Integer performanceCount; // 場次數量
}
