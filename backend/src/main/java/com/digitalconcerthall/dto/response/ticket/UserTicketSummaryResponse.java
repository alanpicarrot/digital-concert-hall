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
    
    // 簡化的建構子，用於 TicketServiceImpl
    public UserTicketSummaryResponse(Long id, Long performanceId, String performanceName, LocalDateTime purchaseDate, String status) {
        this.id = id;
        this.ticketCode = "TK" + id;
        this.concertTitle = performanceName;
        this.createdAt = purchaseDate;
        this.isUsed = "USED".equals(status);
        // 其他屬性可以預設值或在後續加載
    }
}
