package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.PerformanceDetailResponse;
import com.digitalconcerthall.repository.concert.PerformanceRepository;

import java.time.Duration;

/**
 * 表演場次公開控制器
 * 處理客戶端獲取表演場次相關的請求
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600)
@RestController
@RequestMapping("/api/performances")
public class PerformanceController {
    
    @Autowired
    private PerformanceRepository performanceRepository;
    
    /**
     * 根據ID獲取表演場次詳情
     * @param id 表演場次ID
     * @return 表演場次詳情
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPerformanceById(@PathVariable("id") Long id) {
        return performanceRepository.findById(id)
                .map(performance -> {
                    PerformanceDetailResponse response = new PerformanceDetailResponse();
                    response.setId(performance.getId());
                    response.setStartTime(performance.getStartTime());
                    response.setEndTime(performance.getEndTime());
                    response.setVenue(performance.getVenue());
                    response.setStatus(performance.getStatus());
                    
                    // 計算演出時長（分鐘）
                    if (performance.getStartTime() != null && performance.getEndTime() != null) {
                        long durationMinutes = Duration.between(
                            performance.getStartTime(), 
                            performance.getEndTime()
                        ).toMinutes();
                        response.setDuration((int) durationMinutes);
                    } else {
                        response.setDuration(120); // 默認值2小時
                    }
                    
                    // 設置關聯的音樂會信息
                    if (performance.getConcert() != null) {
                        response.setConcertId(performance.getConcert().getId());
                        response.setConcertTitle(performance.getConcert().getTitle());
                        response.setConcertDescription(performance.getConcert().getDescription());
                        response.setPosterUrl(performance.getConcert().getPosterUrl());
                    }
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
