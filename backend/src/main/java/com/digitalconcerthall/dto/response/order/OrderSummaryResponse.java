package com.digitalconcerthall.dto.response.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;  // 使用 LocalDateTime 而不是 Date
import java.util.List;

public class OrderSummaryResponse {
    private Long id;  // 添加id屬性
    private String orderNumber;
    private String status;
    private LocalDateTime orderDate;  // 添加orderDate屬性
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private String paymentMethod;  // 添加paymentMethod屬性
    private String paymentStatus;  // 添加paymentStatus屬性
    private List<OrderItemResponse> items;  // 改名以匹配使用的方法名
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getOrderDate() {
        return orderDate;
    }
    
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public BigDecimal getSubtotalAmount() {
        return subtotalAmount;
    }
    
    public void setSubtotalAmount(BigDecimal subtotalAmount) {
        this.subtotalAmount = subtotalAmount;
    }
    
    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }
    
    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public List<OrderItemResponse> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
    
    // 保持向後兼容的 getter/setter
    public List<OrderItemResponse> getOrderItems() {
        return items;
    }
    
    public void setOrderItems(List<OrderItemResponse> orderItems) {
        this.items = orderItems;
    }
}
