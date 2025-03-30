package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.ForgotPasswordRequest;
import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.PasswordResetRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.AuthService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 打印接收到的登入請求信息
            System.out.println("Received login request for: " + loginRequest.getUsername());
            
            // 如果前端傳來的是 usernameOrEmail 參數，比如在 Request Body 中
            // 我們已經在 UserDetailsServiceImpl 中做了處理，可以使用電子郵件或用戶名登入
            
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            System.out.println("Authentication error in controller: " + e.getMessage());
            return ResponseEntity.status(401).body(new MessageResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // 調試信息
        System.out.println("Received signup request: " + signUpRequest);
        
        MessageResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }
    
    // 新增: 無需認證的管理員註冊端點
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        System.out.println("Received admin signup request: " + signUpRequest);
        
        // 使用現有的註冊服務，但確保為管理員角色
        MessageResponse response = authService.registerAdminUser(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        MessageResponse response = authService.logoutUser();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        MessageResponse response = authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
