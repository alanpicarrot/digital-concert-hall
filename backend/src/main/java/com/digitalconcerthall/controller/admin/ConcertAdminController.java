package com.digitalconcerthall.controller.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.request.ConcertRequest;
import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.repository.concert.ConcertRepository;

@RestController
@RequestMapping("/api/admin/concerts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConcertAdminController {

    @Autowired
    private ConcertRepository concertRepository;

    // 獲取所有音樂會
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Concert>> getAllConcerts() {
        List<Concert> concerts = concertRepository.findAll();
        return ResponseEntity.ok(concerts);
    }

    // 獲取單個音樂會
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getConcertById(@PathVariable("id") Long id) {
        Concert concert = concertRepository.findById(id)
                .orElse(null);
        if (concert == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(concert);
    }

    // 創建新音樂會
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createConcert(@RequestBody ConcertRequest concertRequest) {
        try {
            Concert concert = new Concert();
            concert.setTitle(concertRequest.getTitle());
            concert.setDescription(concertRequest.getDescription());
            concert.setProgramDetails(concertRequest.getProgramDetails());
            concert.setPosterUrl(concertRequest.getPosterUrl());
            concert.setBrochureUrl(concertRequest.getBrochureUrl());
            concert.setStatus(concertRequest.getStatus());
            concert.setCreatedAt(LocalDateTime.now());
            concert.setUpdatedAt(LocalDateTime.now());
            
            Concert savedConcert = concertRepository.save(concert);
            return ResponseEntity.ok(savedConcert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建音樂會失敗: " + e.getMessage()));
        }
    }

    // 更新音樂會
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateConcert(@PathVariable("id") Long id, @RequestBody ConcertRequest concertRequest) {
        try {
            Concert existingConcert = concertRepository.findById(id).orElse(null);
            if (existingConcert == null) {
                return ResponseEntity.notFound().build();
            }
            
            existingConcert.setTitle(concertRequest.getTitle());
            existingConcert.setDescription(concertRequest.getDescription());
            existingConcert.setProgramDetails(concertRequest.getProgramDetails());
            existingConcert.setPosterUrl(concertRequest.getPosterUrl());
            existingConcert.setBrochureUrl(concertRequest.getBrochureUrl());
            existingConcert.setStatus(concertRequest.getStatus());
            existingConcert.setUpdatedAt(LocalDateTime.now());
            
            Concert updatedConcert = concertRepository.save(existingConcert);
            return ResponseEntity.ok(updatedConcert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新音樂會失敗: " + e.getMessage()));
        }
    }

    // 刪除音樂會
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteConcert(@PathVariable("id") Long id) {
        try {
            Concert existingConcert = concertRepository.findById(id).orElse(null);
            if (existingConcert == null) {
                return ResponseEntity.notFound().build();
            }
            
            concertRepository.delete(existingConcert);
            return ResponseEntity.ok(new ApiResponse(true, "音樂會已成功刪除"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "刪除音樂會失敗: " + e.getMessage()));
        }
    }
    
    // 更改音樂會狀態
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateConcertStatus(@PathVariable("id") Long id, @RequestParam String status) {
        try {
            Concert existingConcert = concertRepository.findById(id).orElse(null);
            if (existingConcert == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 驗證狀態是否有效
            if (!status.equals("active") && !status.equals("inactive") && !status.equals("upcoming") && !status.equals("past")) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "無效的狀態值"));
            }
            
            existingConcert.setStatus(status);
            existingConcert.setUpdatedAt(LocalDateTime.now());
            
            Concert updatedConcert = concertRepository.save(existingConcert);
            return ResponseEntity.ok(updatedConcert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新音樂會狀態失敗: " + e.getMessage()));
        }
    }
}
