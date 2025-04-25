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
import com.digitalconcerthall.repository.TicketRepository;
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
        // 詳細記錄訂單創建請求
        try {
            logger.info("Starting order creation with detailed request: {}", cartRequest);
        } catch (Exception e) {
            logger.info("Starting order creation with request that cannot be serialized");
        }
        
        // 1. 檢查購物車請求
        if (cartRequest == null) {
            logger.error("Cart request is null");
            throw new IllegalArgumentException("購物車請求不能為空");
        }
        
        if (cartRequest.getItems() == null || cartRequest.getItems().isEmpty()) {
            logger.error("Cart items are null or empty");
            throw new IllegalArgumentException("購物車項目不能為空");
        }
        
        // 2. 取得並驗證當前用戶
        User currentUser;
        try {
            currentUser = getCurrentUser();
            if (currentUser == null) {
                logger.error("Current user is null after getCurrentUser()");
                throw new AuthenticationFailedException("無法取得用戶信息");
            }
            
            if (currentUser.getId() == null) {
                logger.error("User ID is null for user: {}", currentUser.getUsername());
                throw new IllegalStateException("用戶ID為空，無法建立訂單");
            }
            
            logger.debug("Current authenticated user: ID={}, username={}", currentUser.getId(), currentUser.getUsername());
        } catch (AuthenticationFailedException e) {
            logger.error("Authentication failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage(), e);
            throw new AuthenticationFailedException("驗證用戶時發生錯誤: " + e.getMessage());
        }

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

        // 3. 驗證所有購物車項目
        for (int i = 0; i < cartRequest.getItems().size(); i++) {
            CartItemRequest cartItem = cartRequest.getItems().get(i);
            try {
                // 先詳細記錄每個購物車項目
                logger.debug("Processing cart item [{}]: {}", i, cartItem);
                
                // 嚴格檢查ID是否為空
                if (cartItem.getId() == null) {
                    logger.error("Ticket ID is null in cart item at index {}", i);
                    throw new IllegalArgumentException("票券ID不能為空 (項目 #" + (i+1) + ")");
                }
                
                if (cartItem.getId().trim().isEmpty()) {
                    logger.error("Ticket ID is empty string in cart item at index {}", i);
                    throw new IllegalArgumentException("票券ID不能為空白字串 (項目 #" + (i+1) + ")");
                }
                
                // 檢查數量是否有效
                if (cartItem.getQuantity() <= 0) {
                    logger.error("Invalid quantity for ticket ID {} at index {}: {}", cartItem.getId(), i, cartItem.getQuantity());
                    throw new IllegalArgumentException("票券數量必須大於0 (項目 #" + (i+1) + ")");
                }
                
                // 嚴格地將ID轉換為長整數
                Long ticketId;
                try {
                    ticketId = Long.parseLong(cartItem.getId());
                    logger.info("Processing ticket ID: {}, Concert ID: {}, Type: {}, Quantity: {}", 
                        ticketId, cartItem.getConcertId(), cartItem.getType(), cartItem.getQuantity());
                } catch (NumberFormatException e) {
                    // 詳細記錄格式錯誤
                    logger.error("Invalid ticket ID format at index {}: '{}'", i, cartItem.getId(), e);
                    throw new IllegalArgumentException("票券ID必須是數字 (項目 #" + (i+1) + "): " + cartItem.getId());
                }
            } catch (Exception e) {
                logger.error("Error processing cart item at index {}: {}", i, e.getMessage());
                throw e;
            }

            // 取得票券
            Ticket ticket;
            try {
                ticket = ticketRepository.findById(Long.parseLong(cartItem.getId()))
                        .orElseThrow(() -> {
                            logger.error("Ticket not found with ID: {}", cartItem.getId());
                            return new ResourceNotFoundException("找不到ID為" + cartItem.getId() + "的票券");
                        });
                
                // 確認票券不為空
                if (ticket == null) {
                    logger.error("Ticket is null even though found in repository for ID: {}", cartItem.getId());
                    throw new IllegalStateException("票券對象不能為空");
                }
                
                // 確保票券關聯的資訊完整性
                if (ticket.getPerformance() == null) {
                    logger.error("Ticket has no associated performance. Ticket ID: {}", ticket.getId());
                    throw new IllegalStateException("票券缺少關聯的演出信息");
                }
                
                if (ticket.getPerformance().getConcert() == null) {
                    logger.error("Ticket's performance has no associated concert. Ticket ID: {}", ticket.getId());
                    throw new IllegalStateException("票券的演出缺少關聯的音樂會信息");
                }
                
                if (ticket.getTicketType() == null) {
                    logger.error("Ticket has no associated ticket type. Ticket ID: {}", ticket.getId());
                    throw new IllegalStateException("票券缺少票券類型信息");
                }
            } catch (ResourceNotFoundException e) {
                throw e;
            } catch (Exception e) {
                logger.error("Error retrieving ticket with ID {}: {}", cartItem.getId(), e.getMessage());
                throw new IllegalStateException("取得票券時發生錯誤: " + e.getMessage());
            }

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
        // Correct method name should match DTO field (likely 'concertTitle' based on
        // TicketServiceImpl patterns)
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
            logger.error("User not authenticated - SecurityContext authentication is null or not authenticated");
            throw new AuthenticationFailedException("用户未认证");
        }

        Object principal = authentication.getPrincipal();
        logger.debug("Authentication principal type: {}", principal.getClass().getName());
        logger.debug("Authentication details: principal={}, isAuthenticated={}, authorities={}", 
                 principal, authentication.isAuthenticated(), authentication.getAuthorities());

        if (!(principal instanceof UserDetailsImpl)) {
            logger.error("Invalid principal type: {}", principal.getClass().getName());
            throw new AuthenticationFailedException("Invalid user authentication type");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;
        logger.debug("User details from SecurityContext: id={}, username={}", userDetails.getId(), userDetails.getUsername());
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> {
                    logger.error("User not found in database with ID: {}", userDetails.getId());
                    return new ResourceNotFoundException("User not found with ID: " + userDetails.getId());
                });
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
        if (orderNumber.startsWith("ORD") && orderNumber.substring(3)
                .startsWith(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")))) {
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
