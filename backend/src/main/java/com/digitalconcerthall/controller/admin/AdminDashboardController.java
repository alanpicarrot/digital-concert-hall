package com.digitalconcerthall.controller.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * 管理員儀表板控制器
 * 提供管理員儀表板需要的統計信息和批量操作功能
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminDashboardController {

    @Autowired
    private ConcertRepository concertRepository;
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * 獲取儀表板統計信息
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalConcerts", concertRepository.count());
            stats.put("totalPerformances", performanceRepository.count());
            stats.put("totalTickets", ticketRepository.count());
            stats.put("totalUsers", userRepository.count());
            stats.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "獲取儀表板統計信息失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 批量創建一整套音樂會、場次、票種資料
     * 用於快速創建演示數據
     */
    @PostMapping("/create-demo-concert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDemoConcert() {
        try {
            // 1. 創建音樂會
            Concert concert = new Concert();
            concert.setTitle("莫扎特小提琴協奏曲音樂會");
            concert.setDescription("一場精彩的莫扎特小提琴協奏曲演出，由著名小提琴家張小提擔綱演出。");
            concert.setProgramDetails("莫扎特 - 第三號小提琴協奏曲\n莫扎特 - 第五號小提琴協奏曲\n貝多芬 - 第七交響曲");
            concert.setPosterUrl("/api/concerts/posters/mozart-violin.jpg");
            concert.setStatus("active");
            concert.setCreatedAt(LocalDateTime.now());
            concert.setUpdatedAt(LocalDateTime.now());
            
            // 保存音樂會
            Concert savedConcert = concertRepository.save(concert);
            
            // 2. 創建兩個場次
            // 場次1: 週五晚上
            Performance performance1 = new Performance();
            performance1.setConcert(savedConcert);
            performance1.setStartTime(LocalDateTime.now().plusDays(14).withHour(19).withMinute(30).withSecond(0).withNano(0));
            performance1.setEndTime(performance1.getStartTime().plusHours(2));
            performance1.setVenue("數位音樂廳主廳");
            performance1.setStatus("scheduled");
            performanceRepository.save(performance1);
            
            // 場次2: 週六下午
            Performance performance2 = new Performance();
            performance2.setConcert(savedConcert);
            performance2.setStartTime(LocalDateTime.now().plusDays(15).withHour(14).withMinute(30).withSecond(0).withNano(0));
            performance2.setEndTime(performance2.getStartTime().plusHours(2));
            performance2.setVenue("數位音樂廳主廳");
            performance2.setStatus("scheduled");
            performanceRepository.save(performance2);
            
            // 3. 創建票種
            // VIP票
            TicketType vipTicket = new TicketType();
            vipTicket.setName("VIP票");
            vipTicket.setDescription("最佳視聽位置，含精美節目冊");
            vipTicket.setPrice(new BigDecimal("2000"));
            vipTicket.setColorCode("#FFD700"); // 金色
            vipTicket.setCreatedAt(LocalDateTime.now());
            ticketTypeRepository.save(vipTicket);
            
            // 一般票
            TicketType regularTicket = new TicketType();
            regularTicket.setName("一般票");
            regularTicket.setDescription("標準座位");
            regularTicket.setPrice(new BigDecimal("1200"));
            regularTicket.setColorCode("#C0C0C0"); // 銀色
            regularTicket.setCreatedAt(LocalDateTime.now());
            ticketTypeRepository.save(regularTicket);
            
            // 學生票
            TicketType studentTicket = new TicketType();
            studentTicket.setName("學生票");
            studentTicket.setDescription("學生專屬優惠，需出示有效學生證");
            studentTicket.setPrice(new BigDecimal("800"));
            studentTicket.setColorCode("#CD7F32"); // 銅色
            studentTicket.setCreatedAt(LocalDateTime.now());
            ticketTypeRepository.save(studentTicket);
            
            // 4. 創建票券關聯（可以在前端頁面中完成）
            
            // 返回創建的內容摘要
            Map<String, Object> result = new HashMap<>();
            result.put("concert", savedConcert);
            
            Set<Map<String, Object>> performancesInfo = new HashSet<>();
            Map<String, Object> performance1Info = new HashMap<>();
            performance1Info.put("id", performance1.getId());
            performance1Info.put("startTime", performance1.getStartTime());
            performance1Info.put("venue", performance1.getVenue());
            
            Map<String, Object> performance2Info = new HashMap<>();
            performance2Info.put("id", performance2.getId());
            performance2Info.put("startTime", performance2.getStartTime());
            performance2Info.put("venue", performance2.getVenue());
            
            performancesInfo.add(performance1Info);
            performancesInfo.add(performance2Info);
            result.put("performances", performancesInfo);
            
            Set<Map<String, Object>> ticketTypesInfo = new HashSet<>();
            Map<String, Object> vipTicketInfo = new HashMap<>();
            vipTicketInfo.put("id", vipTicket.getId());
            vipTicketInfo.put("name", vipTicket.getName());
            vipTicketInfo.put("price", vipTicket.getPrice());
            
            Map<String, Object> regularTicketInfo = new HashMap<>();
            regularTicketInfo.put("id", regularTicket.getId());
            regularTicketInfo.put("name", regularTicket.getName());
            regularTicketInfo.put("price", regularTicket.getPrice());
            
            Map<String, Object> studentTicketInfo = new HashMap<>();
            studentTicketInfo.put("id", studentTicket.getId());
            studentTicketInfo.put("name", studentTicket.getName());
            studentTicketInfo.put("price", studentTicket.getPrice());
            
            ticketTypesInfo.add(vipTicketInfo);
            ticketTypesInfo.add(regularTicketInfo);
            ticketTypesInfo.add(studentTicketInfo);
            result.put("ticketTypes", ticketTypesInfo);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建示範音樂會數據失敗: " + e.getMessage()));
        }
    }
}
