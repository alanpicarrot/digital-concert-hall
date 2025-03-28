package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.AuthService;

import jakarta.validation.Valid;

/**
 * 這是一個專門處理 /api/auth/* 路徑請求的控制器
 * 它與 AuthController 功能相同，但處理不同的路徑前綴
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("API 路徑收到登入請求: " + loginRequest.getUsername());
            
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            System.out.println("API 路徑登入失敗: " + e.getMessage());
            if (e.getMessage().contains("Bad credentials")) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("登入失敗: 用戶名或密碼錯誤"));
            }
            return ResponseEntity.status(500)
                    .body(new MessageResponse("登入失敗: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        System.out.println("API 路徑收到註冊請求: " + signUpRequest.getUsername());
        
        MessageResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        System.out.println("API 路徑收到管理員註冊請求: " + signUpRequest.getUsername());
        
        MessageResponse response = authService.registerAdminUser(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        MessageResponse response = authService.logoutUser();
        return ResponseEntity.ok(response);
    }
}
