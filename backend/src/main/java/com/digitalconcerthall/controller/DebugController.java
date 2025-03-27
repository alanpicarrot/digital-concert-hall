package com.digitalconcerthall.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.model.ticket.UserTicket;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.order.OrderRepository;
import com.digitalconcerthall.repository.ticket.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.repository.UserTicketRepository;

/**
 * 僅用於開發環境的調試控制器，不應該在生產環境中使用
 */
@RestController
@RequestMapping("/debug")
@Profile("dev") // 只在開發環境中啟用
public class DebugController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ConcertRepository concertRepository;
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserTicketRepository userTicketRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @GetMapping("/create-test-user")
    public User createTestUser() {
        // 檢查用戶是否已存在
        if (userRepository.existsByUsername("testuser")) {
            return userRepository.findByUsername("testuser").orElse(null);
        }
        
        // 創建新用戶 - 使用构造函數
        User user = new User("testuser", "test@example.com", passwordEncoder.encode("password123"));
        
        // 設置用戶其他屬性
        user.setFirstName("Test");
        user.setLastName("User");
        
        // 設置用戶角色
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);
        user.setRoles(roles);
        
        // 保存用戶
        return userRepository.save(user);
    }
    
    @GetMapping("/create-test-data")
    public String createTestData() {
        try {
            // 先獲取 testuser 用戶
            User user = userRepository.findByUsername("testuser")
                    .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            // 創建音樂會
            Concert concert = new Concert();
            concert.setTitle("莫札特鋼琴協奏曲之夜");
            concert.setDescription("享受莫札特最著名的鋼琴協奏曲精選");
            concert.setProgramDetails("1. 莫札特第21號鋼琴協奏曲\n2. 莫札特第23號鋼琴協奏曲");
            concert.setPosterUrl("https://example.com/images/concert1.jpg");
            concert.setStatus("active");
            concert = concertRepository.save(concert);
            
            // 創建演出場次
            Performance performance = new Performance();
            performance.setConcert(concert);
            performance.setStartTime(LocalDateTime.now().plusDays(30));
            performance.setEndTime(LocalDateTime.now().plusDays(30).plusHours(2));
            performance.setVenue("國家音樂廳");
            performance.setStatus("scheduled");
            performance = performanceRepository.save(performance);
            
            // 創建票種
            TicketType vipTicketType = new TicketType();
            vipTicketType.setName("VIP席");
            vipTicketType.setDescription("最佳視聽位置，含精美節目冊");
            vipTicketType.setPrice(new BigDecimal("1200.00"));
            vipTicketType = ticketTypeRepository.save(vipTicketType);
            
            // 創建票券庫存
            Ticket ticket = new Ticket();
            ticket.setPerformance(performance);
            ticket.setTicketType(vipTicketType);
            ticket.setTotalQuantity(100);
            ticket.setAvailableQuantity(98);
            ticket = ticketRepository.save(ticket);
            
            // 創建訂單
            Order order = new Order();
            order.setUser(user);
            order.setTotalAmount(new BigDecimal("2400.00"));
            order.setStatus("paid");
            order.setPaymentMethod("credit_card");
            order.setPaymentStatus("completed");
            order = orderRepository.save(order);
            
            // 創建訂單項目
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setTicket(ticket);
            orderItem.setQuantity(2);
            orderItem.setUnitPrice(vipTicketType.getPrice());
            orderItem.setSubtotal(vipTicketType.getPrice().multiply(new BigDecimal(2)));
            
            // 將訂單項目添加到訂單
            order.getOrderItems().add(orderItem);
            order = orderRepository.save(order); // 保存訂單及其項目
            
            // 創建用戶票券（每個訂單項目對應的實際票券）
            for (int i = 0; i < orderItem.getQuantity(); i++) {
                UserTicket userTicket = new UserTicket();
                userTicket.setUser(user);
                userTicket.setOrderItem(orderItem);
                userTicket.setIsUsed(false);
                userTicketRepository.save(userTicket);
            }
            
            return "測試數據創建成功！";
        } catch (Exception e) {
            return "創建測試數據失敗: " + e.getMessage();
        }
    }
}
