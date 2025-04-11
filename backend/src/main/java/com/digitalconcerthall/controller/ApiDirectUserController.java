package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API 直接創建用戶的控制器，不需要認證
 * 這是一個緊急解決方案，用於創建測試帳號
 * 提供與 DirectUserController 相同的功能，但使用 /api 前綴
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/direct")
public class ApiDirectUserController {

    @Autowired
    private DirectUserController directUserController;
    
    /**
     * 直接創建一個測試用戶
     */
    @GetMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        return directUserController.createTestUser();
    }
    
    /**
     * 創建一個特定的用戶
     */
    @GetMapping("/create-user/{username}/{password}")
    public ResponseEntity<?> createUser(@PathVariable String username, @PathVariable String password) {
        return directUserController.createUser(username, password);
    }
}
