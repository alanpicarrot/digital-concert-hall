package com.digitalconcerthall.model.ticket;

import com.digitalconcerthall.model.concert.Performance;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data; // Import Lombok Data
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data // Add this annotation
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

    

    @Column(name = "description")
    private String description;

    @Column(name = "status") // 可以考慮改為 Enum
    private String status;

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
        // 注意：Performance 實體中沒有 name 字段，但有 getName() 方法返回 concert.getTitle()
        return performance != null ? performance.getName() : null;
    }

    public LocalDateTime getPerformanceDate() {
        return performance != null ? performance.getStartTime() : null;
    }

    // 新增便捷方法獲取 TicketType 信息 (如果需要)
    public Long getTicketTypeId() {
        return ticketType != null ? ticketType.getId() : null;
    }

    public String getTicketTypeName() {
        return ticketType != null ? ticketType.getName() : null;
    }

    @Column(name = "username") // Add this line
    private String username;   // Add this line

    // Add getter and setter for username
    public String getUsername() { // Add this method
        return username;
    }

    public void setUsername(String username) { // Add this method
        this.username = username;
    }
}
