package com.digitalconcerthall.dto.response.ticket;

import java.math.BigDecimal;

/**
 * 前端客戶端票券類型響應DTO
 * 用於向前端客戶返回票券類型相關信息
 */
public class TicketTypeClientResponse {
    
    private Long id;
    private Long ticketTypeId;
    private String name;
    private String description;
    private BigDecimal price;
    private String colorCode;
    private Integer availableQuantity;
    private Long performanceId;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTicketTypeId() {
        return ticketTypeId;
    }
    
    public void setTicketTypeId(Long ticketTypeId) {
        this.ticketTypeId = ticketTypeId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public Integer getAvailableQuantity() {
        return availableQuantity;
    }
    
    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
    
    public Long getPerformanceId() {
        return performanceId;
    }
    
    public void setPerformanceId(Long performanceId) {
        this.performanceId = performanceId;
    }
}
