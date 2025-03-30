package com.digitalconcerthall.model.ticket;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(length = 255)
    private String description;
    
    @Column(length = 20)
    private String colorCode;
    
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // 方便創建的構造函數
    public TicketType(String name, BigDecimal price, String description) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }
    
    // 包含所有字段的構造函數
    public TicketType(String name, BigDecimal price, String description, String colorCode) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.colorCode = colorCode;
        this.createdAt = LocalDateTime.now();
    }
}