package com.digitalconcerthall.controller;
import com.digitalconcerthall.repository.TicketRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.CartItemRequest;
import com.digitalconcerthall.dto.request.CartRequest;
import com.digitalconcerthall.dto.response.OrderCreationResponse;
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
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.service.UserService;
// import com.digitalconcerthall.service.order.OrderService;  // 未使用

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/orders")
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
            String orderNumber = "DCH" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4);

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

            // 創建並保存所有票券先
            List<Ticket> savedTickets = new ArrayList<>();

            // ==================== 第二步：創建並保存每個票券 ====================
            for (CartItemRequest item : cartRequest.getItems()) {
                System.out.println(
                        "處理商品: " + item.getName() + ", 價格: " + item.getPrice() + ", 數量: " + item.getQuantity());

                // 獲取/創建票券類型
                TicketType ticketType = getOrCreateTicketType(item);

                // 獲取演出場次
                Performance performance = getFirstAvailablePerformance();
                if (performance == null) {
                    throw new RuntimeException("無可用的演出場次");
                }

                // 創建票券
                Ticket ticket = new Ticket();
                ticket.setTicketType(ticketType);
                ticket.setPerformance(performance);
                ticket.setTotalQuantity(item.getQuantity() * 10);
                ticket.setAvailableQuantity(item.getQuantity() * 10 - item.getQuantity());
                ticket.setCreatedAt(LocalDateTime.now());
                ticket.setUsername(currentUser.getUsername()); // 設置username以符合欄位需求

                // 先保存票券，確保有ID
                ticket = ticketRepository.save(ticket);
                savedTickets.add(ticket);
                System.out.println("票券已保存，ID: " + ticket.getId());
            }

            // ==================== 第三步：為每個票券創建訂單項 ====================
            for (int i = 0; i < savedTickets.size(); i++) {
                CartItemRequest item = cartRequest.getItems().get(i);
                Ticket ticket = savedTickets.get(i);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setTicket(ticket);
                orderItem.setQuantity(item.getQuantity());
                orderItem.setUnitPrice(new BigDecimal(item.getPrice()));
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
        try {
            // 先嘗試查詢所有Performance
            List<Performance> allPerformances = performanceRepository.findAll();

            if (allPerformances.isEmpty()) {
                // 如果沒有演出場次，創建一個測試用的
                return createDummyPerformance();
            }

            Optional<Performance> result = performanceRepository.findFirstByStatusNot("cancelled");
            return result.orElse(allPerformances.get(0)); // 如果沒有非取消的，就返回第一個
        } catch (Exception e) {
            System.err.println("獲取演出場次時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            // 如果發生錯誤，創建一個測試用的
            return createDummyPerformance();
        }
    }

    /**
     * 創建一個測試用的演出場次
     */
    private Performance createDummyPerformance() {
        System.out.println("創建臨時演出場次");

        // 先創建一個臨時音樂會
        Concert concert = new Concert();
        concert.setTitle("臨時測試音樂會");
        concert.setDescription("測試用音樂會說明");
        concert.setStatus("active");
        concert = concertRepository.save(concert);

        // 再創建演出場次
        Performance performance = new Performance();
        performance.setConcert(concert);
        performance.setStartTime(LocalDateTime.now().plusDays(1));
        performance.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        performance.setVenue("測試場地");
        performance.setStatus("scheduled");
        return performanceRepository.save(performance);
    }

    /**
     * 獲取或創建票券類型
     */
    private TicketType getOrCreateTicketType(CartItemRequest item) {
        TicketType ticketType;

        // 檢查是否已存在該票券類型
        if (item.getId() != null && !item.getId().isEmpty()) {
            try {
                Long id = Long.valueOf(item.getId());
                ticketType = ticketTypeRepository.findById(id).orElse(null);
            } catch (NumberFormatException e) {
                System.err.println("無法將ID轉換為數字: " + item.getId());
                ticketType = null;
            }
        } else {
            ticketType = null;
        }

        // 如果不存在，創建新的票券類型
        if (ticketType == null) {
            ticketType = new TicketType();
            ticketType.setName(item.getName());
            ticketType.setDescription(item.getName());
            ticketType.setPrice(new BigDecimal(item.getPrice()));
            ticketType = ticketTypeRepository.save(ticketType);
        }

        return ticketType;
    }
}
