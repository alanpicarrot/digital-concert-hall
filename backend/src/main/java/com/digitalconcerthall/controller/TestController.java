package com.digitalconcerthall.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 簡單的測試控制器，用於檢查系統是否正常運行
 */
@RestController
@RequestMapping("/test")
public class TestController {

    /**
     * 簡單的測試端點，不需要認證即可訪問
     */
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok("pong - 測試成功!");
    }
    
    /**
     * 初始化測試端點
     */
    @GetMapping("/init")
    public ResponseEntity<?> init() {
        try {
            // 簡單返回成功消息
            return ResponseEntity.ok("測試初始化成功");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("初始化錯誤: " + e.getMessage());
        }
    }
}
