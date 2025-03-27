package com.digitalconcerthall.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketRequest {
    private Long performanceId;
    private Long ticketTypeId;
    private Integer totalQuantity;
    private Integer availableQuantity;
}
