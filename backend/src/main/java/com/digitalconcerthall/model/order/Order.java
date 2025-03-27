package com.digitalconcerthall.model.order;

import com.digitalconcerthall.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String orderNumber;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(nullable = false, length = 20)
    private String status; // pending, paid, cancelled
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; // pending, completed, failed
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
        if (orderNumber == null) {
            // 生成一個訂單編號，格式：年月日+6位隨機數字
            String dateStr = orderDate.toString().replace("-", "").substring(0, 8);
            String randomNumber = String.format("%06d", (int) (Math.random() * 1000000));
            orderNumber = "ORD" + dateStr + randomNumber;
        }
    }
}
