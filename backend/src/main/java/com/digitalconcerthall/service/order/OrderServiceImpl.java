package com.digitalconcerthall.service.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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

import com.digitalconcerthall.dto.response.order.OrderItemResponse;
import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.dto.request.CartRequest;
import com.digitalconcerthall.dto.request.CartItemRequest;
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
        User currentUser = getCurrentUser();
        Order order = new Order();
        
        // 生成唯一的訂單編號
        String orderNumber = generateOrderNumber();
        order.setOrderNumber(orderNumber);
        order.setUser(currentUser);
        order.setOrderDate(java.time.LocalDateTime.now());
        order.setStatus("pending");
        order.setPaymentStatus("unpaid");
        order.setPaymentMethod("online");

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

        // 轉換為響應對象
        return convertToOrderSummary(savedOrder);
    }

    /**
     * 生成唯一的訂單編號
     */
    private String generateOrderNumber() {
        return "DCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // 其他方法保持不变（之前文件中的其他方法）
    // ...（原有的 getCurrentUserOrders、getOrderByOrderNumber 等方法）

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // 詳細日誌記錄
        logger.info("Authentication object: {}", authentication);
        
        if (authentication == null) {
            logger.error("No authentication object found");
            throw new ResourceNotFoundException("No authentication object found");
        }
        
        if (!authentication.isAuthenticated()) {
            logger.error("User is not authenticated");
            throw new ResourceNotFoundException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        logger.info("Principal object type: {}", principal.getClass().getName());
        
        // 如果主體是字符串 "anonymousUser"，則拋出異常
        if ("anonymousUser".equals(principal)) {
            logger.error("Anonymous user detected");
            throw new ResourceNotFoundException("Anonymous user is not allowed");
        }
        
        // 改用更寬鬆的類型檢查
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            logger.info("User ID from UserDetails: {}", userDetails.getId());
            
            return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userDetails.getId());
                    return new ResourceNotFoundException("User not found with id: " + userDetails.getId());
                });
        }
        
        logger.error("Invalid authentication principal: {}", principal);
        throw new ResourceNotFoundException("Invalid authentication principal");
    }

    // 保留其他方法（convertToOrderSummary 等）
}
