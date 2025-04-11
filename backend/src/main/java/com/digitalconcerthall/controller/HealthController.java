package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康檢查控制器，用於確認服務狀態
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
public class HealthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * 健康檢查端點，包含数据库连接测试
     * @return 包含服務狀態的詳細信息
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        // 基本服務狀態
        response.put("status", "UP");
        response.put("message", "Service is running");
        response.put("timestamp", System.currentTimeMillis());
        
        // 數據庫狀態
        try {
            // 一個簡單的數據庫查詢，檢查連接是否正常
            long userCount = userRepository.count();
            Map<String, Object> dbStatus = new HashMap<>();
            dbStatus.put("status", "UP");
            dbStatus.put("userCount", userCount);
            response.put("database", dbStatus);
        } catch (Exception e) {
            Map<String, Object> dbStatus = new HashMap<>();
            dbStatus.put("status", "DOWN");
            dbStatus.put("error", e.getMessage());
            response.put("database", dbStatus);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 測試回應端點
     * @return 簡單的回應訊息
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
