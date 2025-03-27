package com.digitalconcerthall.dto.response.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;  // 使用 LocalDateTime 而不是 Date

public class OrderItemResponse {
    private Long id;
    private Long ticketId;  // 添加直接的ticketId屬性
    private String concertTitle;  // 添加concertTitle屬性
    private String performanceVenue;  // 添加performanceVenue屬性
    private LocalDateTime performanceStartTime;  // 添加performanceStartTime屬性
    private LocalDateTime performanceEndTime;  // 添加performanceEndTime屬性
    private String ticketTypeName;  // 添加ticketTypeName屬性
    private int quantity;
    private BigDecimal price;
    private BigDecimal unitPrice;  // 添加unitPrice屬性
    private BigDecimal subtotal;  // 添加subtotal屬性
    private TicketResponse ticket;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }
    
    public String getConcertTitle() {
        return concertTitle;
    }
    
    public void setConcertTitle(String concertTitle) {
        this.concertTitle = concertTitle;
    }
    
    public String getPerformanceVenue() {
        return performanceVenue;
    }
    
    public void setPerformanceVenue(String performanceVenue) {
        this.performanceVenue = performanceVenue;
    }
    
    public LocalDateTime getPerformanceStartTime() {
        return performanceStartTime;
    }
    
    public void setPerformanceStartTime(LocalDateTime performanceStartTime) {
        this.performanceStartTime = performanceStartTime;
    }
    
    public LocalDateTime getPerformanceEndTime() {
        return performanceEndTime;
    }
    
    public void setPerformanceEndTime(LocalDateTime performanceEndTime) {
        this.performanceEndTime = performanceEndTime;
    }
    
    public String getTicketTypeName() {
        return ticketTypeName;
    }
    
    public void setTicketTypeName(String ticketTypeName) {
        this.ticketTypeName = ticketTypeName;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public TicketResponse getTicket() {
        return ticket;
    }
    
    public void setTicket(TicketResponse ticket) {
        this.ticket = ticket;
    }
    
    public static class TicketResponse {
        private Long id;
        private TicketTypeResponse ticketType;
        private EventResponse event;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public TicketTypeResponse getTicketType() {
            return ticketType;
        }
        
        public void setTicketType(TicketTypeResponse ticketType) {
            this.ticketType = ticketType;
        }
        
        public EventResponse getEvent() {
            return event;
        }
        
        public void setEvent(EventResponse event) {
            this.event = event;
        }
    }
    
    public static class TicketTypeResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
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
    }
    
    public static class EventResponse {
        private Long id;
        private String name;
        private String description;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
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
    }
}
