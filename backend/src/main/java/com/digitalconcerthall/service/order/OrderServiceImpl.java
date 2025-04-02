package com.digitalconcerthall.service.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.dto.request.CartItemRequest;
import com.digitalconcerthall.dto.request.CartRequest;
import com.digitalconcerthall.dto.response.order.OrderItemResponse;
import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.exception.AuthenticationFailedException;
import com.digitalconcerthall.exception.ResourceNotFoundException;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.repository.ticket.TicketRepository;
import com.digitalconcerthall.security.services.UserDetailsImpl;

@Service
public class OrderServiceImpl implements OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    @Transactional
    public OrderSummaryResponse createOrder(CartRequest cartRequest) {
        logger.info("Starting order creation for cart: {}", cartRequest);
        User currentUser = getCurrentUser();
        logger.debug("Current user: {}", currentUser.getId());
        
        Order order = new Order();
        
        // 生成唯一的訂單編號
        String orderNumber = generateOrderNumber();
        order.setOrderNumber(orderNumber);
        order.setUser(currentUser);
        order.setOrderDate(java.time.LocalDateTime.now());
        order.setStatus("pending");
        order.setPaymentStatus("pending");
        order.setPaymentMethod("online");
        logger.info("Created new order with orderNumber: {} and status: pending", orderNumber);

        // 計算總金額並創建訂單項目
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest cartItem : cartRequest.getItems()) {
            Ticket ticket = ticketRepository.findById(Long.parseLong(cartItem.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + cartItem.getId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setTicket(ticket);
            orderItem.setQuantity(cartItem.getQuantity());
            
            // 直接使用 ticket 的 ticketType 的 price
            BigDecimal unitPrice = ticket.getTicketType().getPrice();
            orderItem.setUnitPrice(unitPrice);
            
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderItem.setSubtotal(subtotal);
            orderItem.setOrder(order);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        // 保存訂單
        Order savedOrder = orderRepository.save(order);
        
        // 強制刷新並確保事務已提交到數據庫，避免立即查詢時找不到訂單
        orderRepository.flush();
        
        logger.info("Order saved successfully and flushed to database: {}", orderNumber);

        // 轉換為響應對象
        return convertToOrderSummary(savedOrder);
    }

    /**
     * 將 Order 轉換為 OrderSummaryResponse
     */
    private OrderSummaryResponse convertToOrderSummary(Order order) {
        OrderSummaryResponse summaryResponse = new OrderSummaryResponse();
        
        summaryResponse.setOrderNumber(order.getOrderNumber());
        summaryResponse.setOrderDate(order.getOrderDate());
        summaryResponse.setTotalAmount(order.getTotalAmount());
        summaryResponse.setStatus(order.getStatus());
        summaryResponse.setPaymentStatus(order.getPaymentStatus());
        
        // 轉換訂單項目
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
            .map(this::convertToOrderItemResponse)
            .collect(Collectors.toList());
        
        summaryResponse.setItems(itemResponses);
        
        return summaryResponse;
    }

    /**
     * 將 OrderItem 轉換為 OrderItemResponse
     */
    private OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse itemResponse = new OrderItemResponse();
        
        itemResponse.setId(orderItem.getTicket().getId());
        // Correct method name should match DTO field (likely 'concertTitle' based on TicketServiceImpl patterns)
        itemResponse.setConcertTitle(orderItem.getTicket().getPerformance().getConcert().getTitle());
        itemResponse.setQuantity(orderItem.getQuantity());
        itemResponse.setUnitPrice(orderItem.getUnitPrice());
        itemResponse.setSubtotal(orderItem.getSubtotal());
        
        return itemResponse;
    }

    /**
     * 生成唯一的訂單編號
     */
    private String generateOrderNumber() {
        // 生成一個訂單編號，格式：年月日+6位隨機數字
        LocalDateTime now = LocalDateTime.now();
        String dateStr = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomNumber = String.format("%06d", (int) (Math.random() * 1000000));
        return "ORD" + dateStr + randomNumber;
        // 不再使用 DCH- 格式
        // return "DCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // 其他方法保持不變
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationFailedException("用户未认证");
        }
        
        // 增强类型检查日志
        Object principal = authentication.getPrincipal();
        logger.debug("Authentication principal type: {}", principal.getClass().getName());
        
        if (!(principal instanceof UserDetailsImpl)) {
            logger.error("无效的principal类型: {}", principal.getClass().getName());
            throw new AuthenticationFailedException("无效的用户认证类型");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        return userRepository.findById(userDetails.getId())
               .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
    }

    @Override
    public Page<OrderSummaryResponse> getCurrentUserOrders(Pageable pageable) {
        User currentUser = getCurrentUser();
        // Changed from findByUserOrderByCreatedAtDesc to findByUserOrderByOrderDateDesc
        Page<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(currentUser, pageable);
        return orders.map(this::convertToOrderSummary);
    }

    @Override
    public OrderSummaryResponse getOrderByOrderNumber(String orderNumber) {
        logger.info("Getting order details for orderNumber: {}", orderNumber);
        
        // 獲取訂單前進行短暫延遲，避免即時查詢導致的隔離問題
        if (orderNumber.startsWith("ORD") && orderNumber.substring(3).startsWith(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))) {
            logger.debug("Order is created today, adding small delay to ensure database consistency");
            try {
                Thread.sleep(300); // 300毫秒延遲，足夠讓大多數數據庫事務完成提交
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        Order order = getOrderEntityByOrderNumber(orderNumber);
        logger.info("Successfully retrieved order: {}, status: {}", order.getOrderNumber(), order.getStatus());
        return convertToOrderSummary(order);
    }

    @Override
    public Order getOrderEntityByOrderNumber(String orderNumber) {
        logger.debug("Finding order with number: {}", orderNumber);
        
        // 主要查找 ORD 格式
        if (orderNumber.startsWith("ORD")) {
            for (int attempt = 0; attempt < 3; attempt++) {
                // 增加重試機制，處理可能的數據庫同步延遲
                Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
                if (orderOpt.isPresent()) {
                    return orderOpt.get();
                }
                
                logger.debug("Order not found on attempt {}, waiting briefly before retry", attempt + 1);
                if (attempt < 2) { // 最後一次嘗試不需要等待
                    try {
                        Thread.sleep(500 * (attempt + 1)); // 逐漸增加等待時間: 500ms, 1000ms
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            
            logger.warn("Order not found with ORD number after multiple attempts: {}", orderNumber);
            throw new ResourceNotFoundException("Order not found with number: " + orderNumber);
        }
        // 向後兼容 - 上面找不到且是 DCH 格式，嘗試轉換為 ORD 格式
        else if (orderNumber.startsWith("DCH-")) {
            // 首先嘗試直接掛 DCH 格式查找（歸頻案例）
            Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
            if (orderOpt.isPresent()) {
                return orderOpt.get();
            }
            
            // 如果找不到，創建可能的 ORD 格式
            String dchPart = orderNumber.substring(4);
            if (dchPart.length() == 8) { // DCH-格式通常是8位字母數字組合
                // 嘗試不同的日期組合，從今天開始往回看 7 天 (減少嘗試次數)
                LocalDateTime now = LocalDateTime.now();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
                
                for (int i = 0; i < 7; i++) {
                    LocalDateTime date = now.minusDays(i);
                    String dateStr = date.format(formatter);
                    String possibleOrderNumber = "ORD" + dateStr + dchPart; 
                    
                    logger.debug("Trying possible ORD format: {}", possibleOrderNumber);
                    Optional<Order> possibleOrder = orderRepository.findByOrderNumber(possibleOrderNumber);
                    if (possibleOrder.isPresent()) {
                        logger.info("Found matching ORD number for DCH-{}: {}", dchPart, possibleOrderNumber);
                        return possibleOrder.get();
                    }
                }
            }
            
            logger.warn("Order not found with DCH number: {} and no matching ORD number found", orderNumber);
            throw new ResourceNotFoundException("Order not found with number: " + orderNumber +
                                             " (We now use ORD format for order numbers, please check your order email)");
        }
        // 不知道格式，直接查找
        else {
            logger.warn("Unknown order number format: {}", orderNumber);
            return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber + 
                                                             " (Order numbers should start with 'ORD')"));
        }
    }

    @Override
@Transactional
public OrderSummaryResponse updateOrderStatus(String orderNumber, String status) {
    logger.info("Updating order status: {} to {}", orderNumber, status);
    Order order = getOrderEntityByOrderNumber(orderNumber);
    
    // 更新訂單狀態
    order.setStatus(status);
    
    // 同時更新付款狀態 - 保持一致性
    if ("paid".equals(status)) {
        order.setPaymentStatus("paid");
        logger.info("Also updating payment status to 'paid'");
        
        // 如果訂單已付款，減少相應的票券庫存
        updateInventory(order);
    } else if ("pending".equals(status)) {
        order.setPaymentStatus("pending");
        logger.info("Also updating payment status to 'pending'");
    } else if ("failed".equals(status)) {
        order.setPaymentStatus("failed");
        logger.info("Also updating payment status to 'failed'");
    }
    
    // 確保數據被及時寫入數據庫 - 增加同步
    orderRepository.flush();
    
    Order updatedOrder = orderRepository.save(order);
    logger.info("Order updated successfully: {}", order.getOrderNumber());
    return convertToOrderSummary(updatedOrder);
}

/**
 * 更新票券庫存
 */
private void updateInventory(Order order) {
    logger.info("Updating inventory for order: {}", order.getOrderNumber());
    try {
        for (OrderItem item : order.getOrderItems()) {
            Ticket ticket = item.getTicket();
            int currentInventory = ticket.getAvailableQuantity();
            int orderQuantity = item.getQuantity();
            
            if (currentInventory >= orderQuantity) {
                // 減少庫存
                ticket.setAvailableQuantity(currentInventory - orderQuantity);
                ticketRepository.save(ticket);
                logger.info("Updated inventory for ticket ID: {}, new quantity: {}", 
                          ticket.getId(), ticket.getAvailableQuantity());
            } else {
                // 庫存不足，記錄警告但仍然繼續處理
                logger.warn("Insufficient inventory for ticket ID: {}, needed: {}, available: {}", 
                           ticket.getId(), orderQuantity, currentInventory);
            }
        }
    } catch (Exception e) {
        logger.error("Error updating inventory: {}", e.getMessage(), e);
        // 不拋出異常，避免影響訂單狀態更新
    }
}
}
