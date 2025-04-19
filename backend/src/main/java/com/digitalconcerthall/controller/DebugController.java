package com.digitalconcerthall.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.repository.UserTicketRepository;

/**
 * 僅用於開發環境的調試控制器，不應該在生產環境中使用
 */
@RestController
@RequestMapping("/debug")
@Profile("dev") // 只在開發環境中啟用
public class DebugController {
    
    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);

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
        return "自動創建測試數據功能已被停用。請手動創建音樂會、演出場次和票種數據，以測試完整購票流程。";
    }

    @GetMapping("/clean-test-data")
    public String cleanTestData() {
        try {
            // 清空票券數據
            userTicketRepository.deleteAll();
            ticketRepository.deleteAll();
            ticketTypeRepository.deleteAll();

            // 清空音樂會數據
            performanceRepository.deleteAll();
            concertRepository.deleteAll();

            // 清空訂單數據（如果有關聯到票券和演出，需要先刪除）
            orderRepository.deleteAll();

            return "成功清除所有測試數據。您現在可以手動創建新的音樂會和票券。";
        } catch (Exception e) {
            return "清除測試數據時發生錯誤：" + e.getMessage();
        }
    }
    
    /**
     * 檢查當前用戶的認證狀態和權限
     */
    @GetMapping("/auth-status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            response.put("authenticated", auth.isAuthenticated());
            response.put("principal", auth.getPrincipal().toString());
            response.put("principal_type", auth.getPrincipal().getClass().getName());
            response.put("authorities", auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList()));
            response.put("details", auth.getDetails() != null ? auth.getDetails().toString() : "null");
            
            logger.debug("Debug auth-status: {}", response);
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found in security context");
            logger.warn("Debug auth-status: No authentication in context");
        }
        
        return ResponseEntity.ok(response);
    }
}
