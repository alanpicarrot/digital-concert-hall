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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @PreAuthorize("hasRole('USER') or hasAuthority('ROLE_USER')")
    public ResponseEntity<OrderSummaryResponse> createOrder(
            @RequestBody CartRequest cartRequest) {
        try {
            logger.info("Received create order request with {} items", 
                     cartRequest.getItems() != null ? cartRequest.getItems().size() : 0);
            
            // 獲取當前認證信息並記錄
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                logger.debug("Authentication: principal={}, authenticated={}, authorities={}", 
                          auth.getPrincipal(), auth.isAuthenticated(), auth.getAuthorities());
            } else {
                logger.warn("No authentication found in SecurityContext");
            }
            
            OrderSummaryResponse order = orderService.createOrder(cartRequest);
            logger.info("Order created successfully: {}", order.getOrderNumber());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error creating order: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * 測試訂單權限 - 無需實際權限即可訪問，用於調試
     */
    @GetMapping("/auth-test")
    public ResponseEntity<Map<String, Object>> testOrderAuth() {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            response.put("authenticated", auth.isAuthenticated());
            response.put("principal_type", auth.getPrincipal().getClass().getName());
            response.put("authorities", auth.getAuthorities());
            response.put("can_create_order", auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER") || 
                          a.getAuthority().equals("USER")));
            
            logger.info("Order auth test called: {}", response);
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found");
            logger.warn("Order auth test: No authentication in context");
        }
        
        return ResponseEntity.ok(response);
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
