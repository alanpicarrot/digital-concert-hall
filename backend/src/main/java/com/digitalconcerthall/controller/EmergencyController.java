package com.digitalconcerthall.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;

/**
 * 緊急測試控制器 - 用於確保API能夠正常工作
 */
@RestController
@RequestMapping("/api/test-api")
public class EmergencyController {

    @Autowired
    private ConcertRepository concertRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("API is working! Current time: " + LocalDateTime.now());
    }

    @GetMapping("/create-data")
    public ResponseEntity<String> createTestData() {
        try {
            // 創建測試音樂會
            Concert concert = new Concert();
            concert.setTitle("New Title");
            concert.setDescription("New Description");
            concert.setProgramDetails("第一部分: 測試曲目\n第二部分: 更多測試曲目");
            concert.setPosterUrl("/api/placeholder/600/400?text=Test");
            concert.setStatus("active");
            concert.setCreatedAt(LocalDateTime.now());
            concert.setUpdatedAt(LocalDateTime.now());

            Concert savedConcert = concertRepository.save(concert);

            // 創建演出場次
            Performance performance = new Performance();
            performance.setConcert(savedConcert);
            performance.setStartTime(LocalDateTime.now().plusDays(7));
            performance.setEndTime(LocalDateTime.now().plusDays(7).plusHours(2));
            performance.setVenue("New Venue");
            performance.setStatus("scheduled");

            performanceRepository.save(performance);

            // 回傳創建的數據信息
            String message = String.format(
                    "測試數據創建成功！\n音樂會ID: %d, 標題: %s\n演出場次ID: %d, 場地: %s",
                    savedConcert.getId(),
                    savedConcert.getTitle(),
                    performance.getId(),
                    performance.getVenue());

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.ok("創建失敗: " + e.getMessage() + "\n堆疊追蹤: " + e.getStackTrace());
        }
    }
}