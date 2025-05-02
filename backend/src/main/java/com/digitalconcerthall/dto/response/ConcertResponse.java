package com.digitalconcerthall.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
    private List<LocalDateTime> startTimes;
    private List<String> venues;
    private Integer performanceCount;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}
