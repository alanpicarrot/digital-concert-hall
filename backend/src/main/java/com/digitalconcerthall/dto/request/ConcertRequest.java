package com.digitalconcerthall.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
