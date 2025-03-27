package com.digitalconcerthall.dto.response.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTicketSummaryResponse {
    
    private Long id;
    private String ticketCode;
    private String concertTitle;
    private String performanceVenue;
    private LocalDateTime performanceStartTime;
    private LocalDateTime performanceEndTime;
    private String ticketTypeName;
    private Boolean isUsed;
    private String orderNumber;
    private LocalDateTime createdAt;
}
