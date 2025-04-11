package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.service.AuthService;

/**
 * 直接認證控制器，提供不帶路徑前綴的身份驗證端點
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
public class DirectAuthController {

    @Autowired
    private AuthService authService;

    /**
     * 直接登入端點，不需要 /api/auth 前綴
     */
    @PostMapping({"/signin", "/api/signin"})
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }
}
