package com.digitalconcerthall.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.request.PerformanceRequest;
import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;

@RestController
@RequestMapping("/admin/performances")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PerformanceAdminController {

    @Autowired
    private PerformanceRepository performanceRepository;
    
    @Autowired
    private ConcertRepository concertRepository;

    // 獲取所有演出場次
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Performance>> getAllPerformances() {
        List<Performance> performances = performanceRepository.findAll();
        return ResponseEntity.ok(performances);
    }

    // 依音樂會ID獲取演出場次
    @GetMapping("/concert/{concertId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Performance>> getPerformancesByConcertId(@PathVariable("concertId") Long concertId) {
        List<Performance> performances = performanceRepository.findByConcertId(concertId);
        return ResponseEntity.ok(performances);
    }

    // 獲取單個演出場次
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPerformanceById(@PathVariable("id") Long id) {
        Performance performance = performanceRepository.findById(id)
                .orElse(null);
        if (performance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(performance);
    }

    // 創建新演出場次
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPerformance(@RequestBody PerformanceRequest performanceRequest) {
        try {
            // 驗證關聯的音樂會是否存在
            Concert concert = concertRepository.findById(performanceRequest.getConcertId())
                    .orElse(null);
            if (concert == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的音樂會"));
            }
            
            Performance performance = new Performance();
            performance.setConcert(concert);
            performance.setStartTime(performanceRequest.getStartTime());
            performance.setEndTime(performanceRequest.getEndTime());
            performance.setVenue(performanceRequest.getVenue());
            performance.setStatus(performanceRequest.getStatus());
            performance.setLivestreamUrl(performanceRequest.getLivestreamUrl());
            performance.setRecordingUrl(performanceRequest.getRecordingUrl());
            
            Performance savedPerformance = performanceRepository.save(performance);
            return ResponseEntity.ok(savedPerformance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建演出場次失敗: " + e.getMessage()));
        }
    }

    // 更新演出場次
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePerformance(@PathVariable("id") Long id, @RequestBody PerformanceRequest performanceRequest) {
        try {
            Performance existingPerformance = performanceRepository.findById(id).orElse(null);
            if (existingPerformance == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 如果請求中包含音樂會ID，則更新音樂會
            if (performanceRequest.getConcertId() != null) {
                Concert concert = concertRepository.findById(performanceRequest.getConcertId()).orElse(null);
                if (concert == null) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的音樂會"));
                }
                existingPerformance.setConcert(concert);
            }
            
            existingPerformance.setStartTime(performanceRequest.getStartTime());
            existingPerformance.setEndTime(performanceRequest.getEndTime());
            existingPerformance.setVenue(performanceRequest.getVenue());
            existingPerformance.setStatus(performanceRequest.getStatus());
            existingPerformance.setLivestreamUrl(performanceRequest.getLivestreamUrl());
            existingPerformance.setRecordingUrl(performanceRequest.getRecordingUrl());
            
            Performance updatedPerformance = performanceRepository.save(existingPerformance);
            return ResponseEntity.ok(updatedPerformance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新演出場次失敗: " + e.getMessage()));
        }
    }

    // 刪除演出場次
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePerformance(@PathVariable("id") Long id) {
        try {
            Performance existingPerformance = performanceRepository.findById(id).orElse(null);
            if (existingPerformance == null) {
                return ResponseEntity.notFound().build();
            }
            
            performanceRepository.delete(existingPerformance);
            return ResponseEntity.ok(new ApiResponse(true, "演出場次已成功刪除"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "刪除演出場次失敗: " + e.getMessage()));
        }
    }
    
    // 更改演出場次狀態
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePerformanceStatus(@PathVariable("id") Long id, @RequestParam String status) {
        try {
            Performance existingPerformance = performanceRepository.findById(id).orElse(null);
            if (existingPerformance == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 驗證狀態是否有效
            if (!status.equals("scheduled") && !status.equals("live") && !status.equals("completed") && !status.equals("cancelled")) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "無效的狀態值"));
            }
            
            existingPerformance.setStatus(status);
            
            Performance updatedPerformance = performanceRepository.save(existingPerformance);
            return ResponseEntity.ok(updatedPerformance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新演出場次狀態失敗: " + e.getMessage()));
        }
    }
}
