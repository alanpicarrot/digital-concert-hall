package com.digitalconcerthall.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;
//import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
// import com.digitalconcerthall.repository.UserRepository;  // 未使用
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.model.concert.Performance;
// import com.digitalconcerthall.security.jwt.JwtUtils;  // 未使用
import com.digitalconcerthall.service.UserService;

/**
 * 測試控制器 - 僅用於開發環境，提供測試數據創建功能
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
@Profile({"dev", "test"}) // 只在開發和測試環境啟用
public class TestController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    /* 未使用的儲存庫
    @Autowired
    private UserRepository userRepository;
    */
    
    /* 未使用的JWT工具
    @Autowired
    private JwtUtils jwtUtils;
    */
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    /**
     * 創建測試訂單
     */
    @PostMapping("/orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> createTestOrder(@RequestBody TestOrderRequest request) {
        // 獲取當前用戶
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // 獲取或創建票券類型
        TicketType ticketType = ticketTypeRepository.findByName("標準票券")
                .orElseGet(() -> {
                    TicketType newType = new TicketType();
                    newType.setName("標準票券");
                    newType.setDescription("標準數位音樂廳體驗");
                    newType.setPrice(new BigDecimal("500"));
                    return ticketTypeRepository.save(newType);
                });
        
        // 創建新訂單
        Order order = new Order();
        order.setOrderNumber(request.getOrderNumber());
        order.setUser(currentUser);
        order.setStatus("pending");
        order.setPaymentStatus("pending");
        // 使用LocalDateTime替代Date作为时间戳
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(new BigDecimal(request.getTotalAmount()));
        // Order类中没有setSubtotalAmount和setDiscountAmount方法，因此移除这些行
        // 如果需要这些字段，请在Order类中添加它们
        
        // 創建訂單項目
        List<OrderItem> orderItems = new ArrayList<>();
        
        // 假設只有一個項目，數量為2
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setQuantity(2);
        item.setUnitPrice(ticketType.getPrice());
        
        // 創建票券
        Ticket ticket = new Ticket();
        ticket.setTicketType(ticketType);
        // 需要設置Performance，否則會違反數據庫約束
        // 從數據庫中獲取第一個演出，如果不存在則創建一個新的
        Performance performance = performanceRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No performance found. Please create a performance first."));
        ticket.setPerformance(performance);
        ticket.setTotalQuantity(100);
        ticket.setAvailableQuantity(100);
        
        item.setTicket(ticket);
        orderItems.add(item);
        
        order.setOrderItems(orderItems);
        
        // 保存訂單
        Order savedOrder = orderRepository.save(order);
        
        return ResponseEntity.ok(savedOrder);
    }
}

class TestOrderRequest {
    private String orderNumber;
    private int totalAmount;
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public int getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }
}
