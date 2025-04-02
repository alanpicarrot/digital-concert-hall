package com.digitalconcerthall.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.repository.ticket.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.security.services.UserDetailsImpl;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    // Add missing repository injections
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @GetMapping("/create-concert")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse> createTestConcert() {
        try {
            // 創建測試音樂會
            Concert concert = new Concert();
            concert.setTitle("莫札特鋼琴協奏曲音樂會");
            concert.setDescription("一場精彩的莫札特鋼琴協奏曲演出，由知名鋼琴家與樂團共同演出");
            concert.setProgramDetails("第一部分: 鋼琴協奏曲第20號\n第二部分: 鋼琴協奏曲第21號\n第三部分: 鋼琴協奏曲第23號");
            concert.setPosterUrl("/api/placeholder/600/400?text=Mozart");
            concert.setStatus("active");
            concert.setCreatedAt(LocalDateTime.now());
            concert.setUpdatedAt(LocalDateTime.now());

            Concert savedConcert = concertRepository.save(concert);

            // 創建演出場次
            Performance performance = new Performance();
            performance.setConcert(savedConcert);
            performance.setStartTime(LocalDateTime.now().plusDays(10));
            performance.setEndTime(LocalDateTime.now().plusDays(10).plusHours(2));
            performance.setVenue("數位音樂廳主廳");
            performance.setStatus("scheduled");

            // Fix variable name from savedPerformance to performance
            Performance savedPerformance = performanceRepository.save(performance);
            
            // Create ticket type
            TicketType vipType = new TicketType();
            vipType.setName("VIP");
            vipType.setDescription("Premium seating with exclusive benefits");
            vipType.setPrice(new BigDecimal("599.00"));
            vipType.setColorCode("#FFD700");
            TicketType savedType = ticketTypeRepository.save(vipType);

            // Create sample ticket
            Ticket ticket = new Ticket();
            ticket.setPerformance(savedPerformance);
            ticket.setTicketType(savedType);
            ticket.setTotalQuantity(100);
            ticket.setAvailableQuantity(100);
            ticket.setPrice(savedType.getPrice());
            ticketRepository.save(ticket);

            return ResponseEntity.ok(new ApiResponse(true, "測試音樂會創建成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試音樂會失敗: " + e.getMessage()));
        }
    }

    // 檢查當前系統中的音樂會數量
    @GetMapping("/count-concerts")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> countConcerts() {
        long count = concertRepository.count();
        return ResponseEntity.ok("系統中現有 " + count + " 場音樂會");
    }

    // 列出所有演出場次信息
    @GetMapping("/list-performances")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<String>> listPerformances() {
        List<Performance> performances = performanceRepository.findAll();
        List<String> result = new ArrayList<>();
        
        for (Performance perf : performances) {
            Concert concert = perf.getConcert();
            String info = String.format(
                "演出ID: %d, 音樂會: %s, 場地: %s, 時間: %s", 
                perf.getId(), 
                concert != null ? concert.getTitle() : "未知",
                perf.getVenue(),
                perf.getStartTime()
            );
            result.add(info);
        }
        
        return ResponseEntity.ok(result);
    }

    // 創建測試訂單
    @PostMapping("/orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> createTestOrder(@RequestBody TestOrderRequest request) {
        try {
            // 獲取當前用戶
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("找不到當前用戶"));

            // 創建測試訂單
            Order order = new Order();
            order.setUser(user);
            order.setOrderNumber(request.getOrderNumber());
            order.setTotalAmount(new BigDecimal(request.getTotalAmount()));
            order.setStatus("pending");
            order.setPaymentMethod("credit_card");
            order.setPaymentStatus("pending");
            order.setOrderDate(LocalDateTime.now());

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    // 測試訂單請求類
    static class TestOrderRequest {
        private String orderNumber;
        private String totalAmount;
        private List<OrderItemRequest> items;

        public String getOrderNumber() {
            return orderNumber;
        }

        public void setOrderNumber(String orderNumber) {
            this.orderNumber = orderNumber;
        }

        public String getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(String totalAmount) {
            this.totalAmount = totalAmount;
        }

        public List<OrderItemRequest> getItems() {
            return items;
        }

        public void setItems(List<OrderItemRequest> items) {
            this.items = items;
        }
    }

    static class OrderItemRequest {
        private String name;
        private int quantity;
        private double price;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }
    }
}