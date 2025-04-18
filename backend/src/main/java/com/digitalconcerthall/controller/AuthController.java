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

import java.util.HashSet;
import java.util.Set;

import jakarta.validation.Valid;

@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
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

        try {
            // 確保註冊資料包含管理員角色
            if (signUpRequest.getRole() == null || signUpRequest.getRole().isEmpty()) {
                Set<String> roles = new HashSet<>();
                roles.add("admin");
                signUpRequest.setRole(roles);
                System.out.println("Added admin role to signup request");
            }
            
            // 使用現有的註冊服務，但確保為管理員角色
            MessageResponse response = authService.registerAdminUser(signUpRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error during admin registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                   .body(new MessageResponse("Admin registration failed: " + e.getMessage()));
        }
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
