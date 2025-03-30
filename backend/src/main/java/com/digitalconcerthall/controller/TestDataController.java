package com.digitalconcerthall.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.ticket.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;

/**
 * 測試數據控制器 - 用於創建測試數據
 */
@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestDataController {

    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private PerformanceRepository performanceRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    /**
     * 創建測試音樂會
     */
    @GetMapping("/create-concert")
    public ResponseEntity<ApiResponse> createConcert() {
        try {
            // 創建貝多芬音樂會
            Concert beethovenConcert = new Concert();
            beethovenConcert.setTitle("貝多芬鋼琴奏鳴曲全集");
            beethovenConcert.setDescription("一場精彩的貝多芬鋼琴奏鳴曲演出，由國際知名鋼琴家演奏，包含「月光」、「悲愴」與「熱情」等著名奏鳴曲。");
            beethovenConcert.setProgramDetails("第一部分: 悲愴奏鳴曲\n第二部分: 月光奏鳴曲\n第三部分: 熱情奏鳴曲");
            beethovenConcert.setPosterUrl("/api/placeholder/600/400?text=Beethoven");
            beethovenConcert.setStatus("active");
            beethovenConcert.setCreatedAt(LocalDateTime.now());
            beethovenConcert.setUpdatedAt(LocalDateTime.now());
            
            Concert savedBeethovenConcert = concertRepository.save(beethovenConcert);
            
            // 創建演出場次
            Performance beethovenPerformance = new Performance();
            beethovenPerformance.setConcert(savedBeethovenConcert);
            beethovenPerformance.setStartTime(LocalDateTime.now().plusDays(7));
            beethovenPerformance.setEndTime(LocalDateTime.now().plusDays(7).plusHours(2));
            beethovenPerformance.setVenue("數位音樂廳主廳");
            beethovenPerformance.setStatus("scheduled");
            
            performanceRepository.save(beethovenPerformance);
            
            // 創建莫札特音樂會
            Concert mozartConcert = new Concert();
            mozartConcert.setTitle("莫札特鋼琴協奏曲");
            mozartConcert.setDescription("由知名鋼琴家與數位音樂廳管弦樂團合作，呈現莫札特最優美的鋼琴協奏曲作品。");
            mozartConcert.setProgramDetails("第一部分: 鋼琴協奏曲 K.466\n第二部分: 鋼琴協奏曲 K.467\n第三部分: 鋼琴協奏曲 K.488");
            mozartConcert.setPosterUrl("/api/placeholder/600/400?text=Mozart");
            mozartConcert.setStatus("active");
            mozartConcert.setCreatedAt(LocalDateTime.now());
            mozartConcert.setUpdatedAt(LocalDateTime.now());
            
            Concert savedMozartConcert = concertRepository.save(mozartConcert);
            
            // 創建演出場次
            Performance mozartPerformance = new Performance();
            mozartPerformance.setConcert(savedMozartConcert);
            mozartPerformance.setStartTime(LocalDateTime.now().plusDays(14));
            mozartPerformance.setEndTime(LocalDateTime.now().plusDays(14).plusHours(2));
            mozartPerformance.setVenue("數位音樂廳主廳");
            mozartPerformance.setStatus("scheduled");
            
            performanceRepository.save(mozartPerformance);
            
            return ResponseEntity.ok(new ApiResponse(true, "成功創建測試音樂會"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試音樂會失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 創建票種資料
     */
    @GetMapping("/create-ticket-types")
    public ResponseEntity<ApiResponse> createTicketTypes() {
        try {
            // 創建票種
            List<TicketType> ticketTypes = new ArrayList<>();
            
            TicketType vipTicket = new TicketType();
            vipTicket.setName("VIP票");
            vipTicket.setDescription("VIP區域座位，提供最佳觀賞視角");
            vipTicket.setPrice(new BigDecimal("1500"));
            ticketTypes.add(vipTicket);
            
            TicketType normalTicket = new TicketType();
            normalTicket.setName("普通票");
            normalTicket.setDescription("一般座席，提供舒適的觀賞體驗");
            normalTicket.setPrice(new BigDecimal("800"));
            ticketTypes.add(normalTicket);
            
            TicketType studentTicket = new TicketType();
            studentTicket.setName("學生票");
            studentTicket.setDescription("學生專屬優惠票，須出示學生證");
            studentTicket.setPrice(new BigDecimal("500"));
            ticketTypes.add(studentTicket);
            
            ticketTypeRepository.saveAll(ticketTypes);
            
            return ResponseEntity.ok(new ApiResponse(true, "成功創建票種資料"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建票種失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 創建票券資料
     */
    @GetMapping("/create-tickets")
    public ResponseEntity<ApiResponse> createTickets() {
        try {
            // 獲取所有票種
            List<TicketType> ticketTypes = ticketTypeRepository.findAll();
            if (ticketTypes.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "請先創建票種"));
            }
            
            // 獲取所有演出場次
            List<Performance> performances = performanceRepository.findAll();
            if (performances.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "請先創建音樂會及演出場次"));
            }
            
            // 創建票券
            List<Ticket> tickets = new ArrayList<>();
            Random random = new Random();
            
            for (Performance performance : performances) {
                for (TicketType ticketType : ticketTypes) {
                    Ticket ticket = new Ticket();
                    ticket.setPerformance(performance);
                    ticket.setTicketType(ticketType);
                    ticket.setPrice(ticketType.getPrice());
                    
                    // 隨機設置票券數量
                    int totalQuantity = 50 + random.nextInt(50);
                    ticket.setTotalQuantity(totalQuantity);
                    ticket.setAvailableQuantity(totalQuantity);
                    
                    ticket.setDescription(ticketType.getName() + " - " + performance.getConcert().getTitle());
                    ticket.setStatus("active");
                    
                    tickets.add(ticket);
                }
            }
            
            ticketRepository.saveAll(tickets);
            
            return ResponseEntity.ok(new ApiResponse(true, "成功創建票券資料"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建票券失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 創建測試用戶
     */
    @GetMapping("/create-test-user")
    public ResponseEntity<ApiResponse> createTestUser() {
        try {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("testuser@example.com");
            // 在沒有加密的情況下直接設置密碼
            testUser.setPassword("password123");
            testUser.setFirstName("測試");
            testUser.setLastName("用戶");
            
            // 給用戶分配 ROLE_USER 角色
            try {
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseGet(() -> {
                            Role newRole = new Role(ERole.ROLE_USER);
                            return roleRepository.save(newRole);
                        });
                
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                testUser.setRoles(roles);
            } catch (Exception e) {
                System.out.println("設置用戶角色失敗: " + e.getMessage());
            }
            
            userRepository.save(testUser);
            
            return ResponseEntity.ok(new ApiResponse(true, "成功創建測試用戶"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試用戶失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 創建所有測試數據
     */
    @GetMapping("/create-all")
    public ResponseEntity<ApiResponse> createAllTestData() {
        try {
            createConcert();
            createTicketTypes();
            createTickets();
            createTestUser();
            
            return ResponseEntity.ok(new ApiResponse(true, "成功創建所有測試數據"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建所有測試數據失敗: " + e.getMessage()));
        }
    }
}