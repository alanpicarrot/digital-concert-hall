package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.service.order.OrderService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users/me")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 獲取當前登錄用戶的所有訂單
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderSummaryResponse>> getCurrentUserOrders(
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<OrderSummaryResponse> orders = orderService.getCurrentUserOrders(pageable);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * 根據訂單編號獲取訂單詳情
     */
    @GetMapping("/orders/{orderNumber}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<OrderSummaryResponse> getOrderByOrderNumber(
            @PathVariable String orderNumber) {
        
        OrderSummaryResponse order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }
}
