package com.digitalconcerthall.controller;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/admin")
public class AdminAuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/signin")
    public ResponseEntity<AdminUserLoginResponse> authenticateAdmin(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(adminAuthService.authenticateAdmin(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody AdminUserCreateRequest signUpRequest) {
        MessageResponse response = adminAuthService.registerAdmin(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logoutAdmin() {
        // 這裡只需回傳成功訊息即可，無需做任何資料庫操作
        return ResponseEntity.ok(new MessageResponse("管理員已成功登出"));
    }

    // 其他後台管理員相關認證端點...
}