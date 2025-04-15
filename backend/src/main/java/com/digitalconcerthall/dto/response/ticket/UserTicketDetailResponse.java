package com.digitalconcerthall.dto.response.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTicketDetailResponse {
    
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
    private String qrCodeBase64; // 票券QR Code的Base64編碼
    private String posterUrl; // 音樂會海報URL
    private String concertDescription; // 音樂會描述
    private String programDetails; // 演出曲目詳情
    
    // 簡化的建構子，用於 TicketServiceImpl
    public UserTicketDetailResponse(Long id, Long performanceId, String performanceName, 
                                   LocalDateTime performanceDate, String seatNumber, 
                                   java.math.BigDecimal price, String status, LocalDateTime purchaseDate) {
        this.id = id;
        this.ticketCode = "TK" + id;
        this.concertTitle = performanceName;
        this.performanceStartTime = performanceDate;
        this.isUsed = "USED".equals(status);
        this.createdAt = purchaseDate;
        // 其他屬性可以預設值或在後續加載
    }
}
