package com.digitalconcerthall.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.CartRequest;
import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.service.order.OrderService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    /**
     * 創建新訂單
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderSummaryResponse> createOrder(
            @RequestBody CartRequest cartRequest) {
        OrderSummaryResponse order = orderService.createOrder(cartRequest);
        logger.info("Order created successfully: {}", order.getOrderNumber());
        return ResponseEntity.ok(order);
    }
    
    /**
     * 獲取當前登錄用戶的所有訂單
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderSummaryResponse>> getCurrentUserOrders(
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<OrderSummaryResponse> orders = orderService.getCurrentUserOrders(pageable);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * 根據訂單編號獲取訂單詳情
     */
    @GetMapping("/{orderNumber}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OrderSummaryResponse> getOrderByOrderNumber(
            @PathVariable String orderNumber) {
        
        logger.info("API request for order: {}", orderNumber);
        OrderSummaryResponse order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }
    
    /**
     * 快速檢查訂單是否存在 (輕量級方法)
     */
    @GetMapping("/{orderNumber}/exists")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkOrderExists(
            @PathVariable String orderNumber) {
        
        boolean exists = orderRepository.existsByOrderNumber(orderNumber);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("orderNumber", orderNumber);
        logger.info("Order existence check for {}: {}", orderNumber, exists);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 獲取最近創建的訂單 (僅限管理員使用，用於檢測訂單創建問題)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getRecentOrders() {
        Pageable limit = PageRequest.of(0, 10); // 只取最近 10 筆
        List<Order> recentOrders = orderRepository.findRecentOrders(limit);
        return ResponseEntity.ok(recentOrders);
    }
}
