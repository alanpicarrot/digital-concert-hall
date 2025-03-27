package com.digitalconcerthall.model.ticket;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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
    
    // 方便創建的構造函數
    public TicketType(String name, BigDecimal price, String description) {
        this.name = name;
        this.price = price;
        this.description = description;
    }
}