package com.digitalconcerthall.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.digitalconcerthall.dto.request.CartItemRequest;
import com.digitalconcerthall.security.services.UserDetailsImpl;

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
    @PreAuthorize("hasAuthority('ROLE_USER')") // 簡化為單一檔查，符合JWT中的角色格式
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
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
            
            // 詳細記錄所有認證細節
            if (auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                response.put("user_id", userDetails.getId());
                response.put("username", userDetails.getUsername());
                response.put("email", userDetails.getEmail());
            }
            
            logger.info("Order auth test called with details: {}", response);
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found");
            logger.warn("Order auth test: No authentication in context");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 測試訂單創建 - 可用來驗證請求數據
     * 此端點不需要認證權限，用於診斷問題
     */
    @PostMapping("/test-create")
    public ResponseEntity<?> testOrderCreation(@RequestBody CartRequest cartRequest) {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // 記錄認證信息
        response.put("authenticated", auth != null && auth.isAuthenticated());
        response.put("principal", auth != null ? auth.getPrincipal().toString() : "null");
        response.put("authorities", auth != null ? auth.getAuthorities().toString() : "null");
        
        // 檢查請求頭
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", getHeaderValue("Authorization"));
        response.put("headers", headers);
        
        // 檢查購物車數據
        response.put("cartItems", cartRequest.getItems() != null ? cartRequest.getItems().size() : 0);
        if (cartRequest.getItems() != null && !cartRequest.getItems().isEmpty()) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (CartItemRequest item : cartRequest.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("type", item.getType());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("concertId", item.getConcertId());
                itemMap.put("price", item.getPrice());
                items.add(itemMap);
            }
            response.put("items", items);
        }
        
        logger.info("Test order creation: {}", response);
        return ResponseEntity.ok(response);
    }
    
    // 輔助方法，安全地取得請求頭部值
    private String getHeaderValue(String headerName) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String headerValue = request.getHeader(headerName);
            
            // 象遞性地遺得令牌
            if (headerName.equalsIgnoreCase("Authorization") && headerValue != null && headerValue.length() > 15) {
                return headerValue.substring(0, 15) + "...";
            }
            
            return headerValue;
        } catch (Exception e) {
            return "Could not retrieve header: " + e.getMessage();
        }
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
