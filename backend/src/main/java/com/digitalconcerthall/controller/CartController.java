package com.digitalconcerthall.controller;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.CartItemRequest;
import com.digitalconcerthall.dto.request.CartRequest;
import com.digitalconcerthall.dto.response.OrderCreationResponse;
import com.digitalconcerthall.exception.ResourceNotFoundException;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.repository.TicketTypeRepository;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.service.UserService;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private UserService userService;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private TicketRepository ticketRepository;


    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private ConcertRepository concertRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 從購物車創建訂單 - 使用更低層級的方法處理實體關係
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrderFromCart(@RequestBody CartRequest cartRequest) {
        try {
            System.out.println("收到購物車結帳請求, 項目數量: " +
                    (cartRequest.getItems() != null ? cartRequest.getItems().size() : 0));

            // 獲取當前用戶
            User currentUser = null;
            try {
                currentUser = userService.getCurrentUser();
            } catch (Exception e) {
                System.out.println("未找到用戶信息，使用臨時用戶: " + e.getMessage());
                // 使用臨時用戶完成訂單流程(用於匿名購買)
                currentUser = new User();
                currentUser.setUsername("guest_" + System.currentTimeMillis());
                currentUser.setEmail("guest@example.com");
            }
            
            if (currentUser == null) {
                System.out.println("未找到用戶信息，且無法創建臨時用戶");
                return ResponseEntity.badRequest().body(new OrderCreationResponse("error", "未找到用戶信息"));
            }

            // ==================== 第一步：創建訂單 ====================
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            String dateStr = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            String randomNumber = String.format("%06d", (int) (Math.random() * 1000000));
            String orderNumber = "ORD" + dateStr + randomNumber;

            Order order = new Order();
            order.setOrderNumber(orderNumber);
            order.setUser(currentUser);
            order.setStatus("pending");
            order.setPaymentStatus("pending");
            order.setOrderDate(LocalDateTime.now());
            order.setOrderItems(new ArrayList<>()); // 初始化空列表

            // 計算總金額 (先設為0，後面會更新)
            BigDecimal totalAmount = BigDecimal.ZERO;

            // 先保存訂單，獲取ID
            order = orderRepository.save(order);

            // ==================== 第二步：為購物車中的每個項目創建訂單項 ====================
            for (CartItemRequest item : cartRequest.getItems()) {
                System.out.println(
                        "處理購物車項目: " + item.getName() + ", Ticket ID: " + item.getId() + ", 數量: " + item.getQuantity());

                // 從請求中獲取票券ID並查找票券實體
                if (item.getId() == null || item.getId().isEmpty()) {
                    throw new IllegalArgumentException("Cart item ID is missing for: " + item.getName());
                }
                Ticket fetchedTicket = ticketRepository.findById(Long.parseLong(item.getId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + item.getId()));

                // 獲取演出場次 (雖然OrderItem不直接存儲，但可以從票券中獲取上下文)
                // Performance performance = fetchedTicket.getPerformance(); // Not directly used in OrderItem

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setTicket(fetchedTicket); // 使用從數據庫獲取的票券
                orderItem.setQuantity(item.getQuantity());
                // 使用票券類型中的價格，而不是請求中的價格
                orderItem.setUnitPrice(fetchedTicket.getTicketType().getPrice()); 
                orderItem.setSubtotal(orderItem.getUnitPrice().multiply(new BigDecimal(orderItem.getQuantity())));

                // 將訂單項添加到訂單的集合中
                order.getOrderItems().add(orderItem);

                // 更新總金額
                totalAmount = totalAmount.add(orderItem.getSubtotal());
            }

            // ==================== 第四步：更新訂單總金額 ====================
            order.setTotalAmount(totalAmount);
            order = orderRepository.save(order); // 這會級聯保存所有的 orderItems
            System.out.println("訂單更新完成，總金額: " + order.getTotalAmount());

            // 返回訂單創建結果
            OrderCreationResponse response = new OrderCreationResponse(
                    order.getOrderNumber(),
                    "pending", // 使用固定狀態，因為在創建訂單時已設置為pending
                    order.getTotalAmount().doubleValue());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("訂單創建失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(new OrderCreationResponse("error", "創建訂單時發生錯誤: " + e.getMessage()));
        }
    }

    /**
     * 獲取第一個可用的演出場次
     */
    private Performance getFirstAvailablePerformance() {
        List<Performance> allPerformances = performanceRepository.findAll();

        if (allPerformances.isEmpty()) {
            throw new ResourceNotFoundException("No available performances found.");
        }

        Optional<Performance> result = performanceRepository.findFirstByStatusNot("cancelled");
        return result.orElseThrow(() -> new ResourceNotFoundException("No available performances found."));
    }
}
