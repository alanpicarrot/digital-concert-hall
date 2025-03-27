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
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // 調試信息
        System.out.println("Received signup request: " + signUpRequest);
        
        MessageResponse response = authService.registerUser(signUpRequest);
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
