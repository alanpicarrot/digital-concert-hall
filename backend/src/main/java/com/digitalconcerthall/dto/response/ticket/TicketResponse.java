package com.digitalconcerthall.dto.response.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long id;
    private String ticketCode;
    private String concertTitle;
    private String performanceVenue;
    private LocalDateTime performanceStartTime;
    private LocalDateTime performanceEndTime;
    private String ticketTypeName;
    private boolean used;
    private LocalDateTime usedTime;
    private LocalDateTime createdAt;

    // 用於生成QR碼的完整票券驗證URL
    private String verificationUrl;
    
    // 簡化的建構子，用於 TicketServiceImpl
    public TicketResponse(Long id, Long performanceId, String seatNumber, java.math.BigDecimal price, String status) {
        this.id = id;
        this.ticketCode = "TK" + id;
        // 其他屬性可以預設值或在後續加載
    }
}
