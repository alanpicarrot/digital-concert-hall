package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;

import java.util.HashMap;
import java.util.Map;

/**
 * 儀表板測試控制器
 * 提供特定端點用於測試前端與後端的連接
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, 
             maxAge = 3600, 
             allowCredentials = "true",
             allowedHeaders = "*")
@RestController
@RequestMapping("/api/dashboard-test")
public class DashboardTestController {

    @Autowired
    private ConcertRepository concertRepository;
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    @Autowired
    private TicketRepository ticketRepository;

    /**
     * 測試儀表板端點
     * 返回各實體數量的統計信息
     */
    @GetMapping
    public ResponseEntity<?> dashboardTest() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("concertCount", concertRepository.count());
            stats.put("performanceCount", performanceRepository.count());
            stats.put("ticketTypeCount", ticketTypeRepository.count());
            stats.put("ticketCount", ticketRepository.count());
            stats.put("serverTime", System.currentTimeMillis());
            stats.put("status", "success");
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "儀表板測試失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 自動創建測試數據
     */
    @GetMapping("/seed-test-data")
    public ResponseEntity<?> seedTestData() {
        try {
            // 清理現有數據（謹慎使用）
            // ticketRepository.deleteAll();
            // performanceRepository.deleteAll();
            // concertRepository.deleteAll();
            
            // 創建一個音樂會測試數據
            if (concertRepository.count() == 0) {
                ConcertController concertController = new ConcertController();
                // 使用已經存在的測試數據創建方法
                return concertController.createTestData();
            } else {
                return ResponseEntity.ok(new ApiResponse(true, "已有數據，無需創建測試數據"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試數據失敗: " + e.getMessage()));
        }
    }
}
