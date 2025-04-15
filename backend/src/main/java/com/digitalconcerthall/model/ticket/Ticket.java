package com.digitalconcerthall.model.ticket;

import com.fasterxml.jackson.annotation.JsonBackReference;

import com.digitalconcerthall.model.concert.Performance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "performance_id", nullable = false)
    @JsonBackReference
    private Performance performance;
    
    @ManyToOne
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;
    
    @Column(name = "total_quantity", nullable = false)
    private int totalQuantity;
    
    @Column(name = "available_quantity", nullable = false)
    private int availableQuantity;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;
    
    @Column(name = "seat_number")
    private String seatNumber;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // 便捷方法
    public Long getPerformanceId() {
        return performance != null ? performance.getId() : null;
    }
    
    public String getPerformanceName() {
        return performance != null ? performance.getName() : null;
    }
    
    public LocalDateTime getPerformanceDate() {
        return performance != null ? performance.getStartTime() : null;
    }
}
