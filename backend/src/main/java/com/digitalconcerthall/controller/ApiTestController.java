package com.digitalconcerthall.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 處理 /api/test/* 路徑的測試控制器
 * 與 TestController 功能相同，但處理不同的路徑前綴
 */
@RestController
@RequestMapping("/api/test")
public class ApiTestController {

    /**
     * 簡單的測試端點，不需要認證即可訪問
     */
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok("pong - API 測試成功!");
    }
    
    /**
     * 初始化測試端點
     */
    @GetMapping("/init")
    public ResponseEntity<?> init() {
        try {
            // 簡單返回成功消息
            return ResponseEntity.ok("API 測試初始化成功");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("初始化錯誤: " + e.getMessage());
        }
    }
}
