package com.digitalconcerthall.service.order;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.digitalconcerthall.dto.response.order.OrderItemResponse;
import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.exception.ResourceNotFoundException;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.security.services.UserDetailsImpl;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Page<OrderSummaryResponse> getCurrentUserOrders(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Order> orders = orderRepository.findByUser(currentUser, pageable);
        
        return orders.map(this::convertToOrderSummary);
    }

    @Override
    public OrderSummaryResponse getOrderByOrderNumber(String orderNumber) {
        User currentUser = getCurrentUser();
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        
        // 確保只有訂單所有者可以查看訂單
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Order not found with order number: " + orderNumber);
        }
        
        return convertToOrderSummary(order);
    }
    
    @Override
    public Order getOrderEntityByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
    }
    
    @Override
    public boolean updateOrderStatus(String orderNumber, String status) {
        Order order = getOrderEntityByOrderNumber(orderNumber);
        order.setStatus(status);
        
        if ("paid".equals(status)) {
            order.setPaymentStatus("completed");
        } else if ("failed".equals(status)) {
            order.setPaymentStatus("failed");
        }
        
        orderRepository.save(order);
        return true;
    }
    
    /**
     * 將Order實體轉換為OrderSummaryResponse DTO
     */
    private OrderSummaryResponse convertToOrderSummary(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        
        OrderSummaryResponse response = new OrderSummaryResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setItems(itemResponses);
        
        return response;
    }
    
    /**
     * 將OrderItem實體轉換為OrderItemResponse DTO
     */
    private OrderItemResponse convertToOrderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setTicketId(item.getTicket().getId());
        response.setConcertTitle(item.getTicket().getPerformance().getConcert().getTitle());
        response.setPerformanceVenue(item.getTicket().getPerformance().getVenue());
        response.setPerformanceStartTime(item.getTicket().getPerformance().getStartTime());
        response.setPerformanceEndTime(item.getTicket().getPerformance().getEndTime());
        response.setTicketTypeName(item.getTicket().getTicketType().getName());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setSubtotal(item.getSubtotal());
        
        return response;
    }
    
    /**
     * 獲取當前登錄用戶
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }
}
