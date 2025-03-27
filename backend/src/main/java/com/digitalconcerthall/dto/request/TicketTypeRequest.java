package com.digitalconcerthall.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketTypeRequest {
    private String name;
    private String description;
    private String price;  // 使用字串以避免精度問題，在Controller中轉換為BigDecimal
}
