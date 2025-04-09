package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.FirstAdminService;

import jakarta.validation.Valid;

/**
 * 處理首次管理員註冊的控制器
 * 這個控制器提供的端點不需要認證即可訪問
 * 用於系統初始化時註冊第一個管理員帳號，該帳號將繞過某些後續註冊才需要的認證邏輯
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/setup")
public class FirstAdminController {

    @Autowired
    private FirstAdminService firstAdminService;

    /**
     * 註冊系統中的第一個管理員帳號
     * 只有在系統中沒有管理員時才能使用
     * 此註冊過程將繞過某些後續註冊才需要的驗證，例如電子郵件確認、額外的密碼強度驗證等
     */
    @PostMapping("/first-admin")
    public ResponseEntity<?> registerFirstAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        // 檢查系統是否已有管理員
        if (firstAdminService.isFirstAdmin()) {
            // 系統中還沒有管理員，可以創建
            MessageResponse response = firstAdminService.registerFirstAdmin(signUpRequest);
            return ResponseEntity.ok(response);
        } else {
            // 系統中已有管理員，不允許使用此端點
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("系統已有管理員，請使用正常註冊流程"));
        }
    }
    
    /**
     * 檢查系統是否需要首次管理員註冊
     */
    @GetMapping("/check-first-admin")
    public ResponseEntity<?> checkFirstAdmin() {
        boolean isFirstAdmin = firstAdminService.isFirstAdmin();
        return ResponseEntity.ok(new MessageResponse(String.valueOf(isFirstAdmin)));
    }
}
