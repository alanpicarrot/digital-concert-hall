package com.digitalconcerthall.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConcertRequest {
    private String title;
    private String description;
    private String programDetails;
    private String posterUrl;
    private String brochureUrl;
    private String status;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
