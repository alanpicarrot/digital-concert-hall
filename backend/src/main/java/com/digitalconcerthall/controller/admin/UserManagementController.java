package com.digitalconcerthall.controller.admin;

import com.digitalconcerthall.dto.response.UserInfoResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.UserManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/account")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    /**
     * 查詢個人帳號訊息
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // 假設 UserDetails 的 username 對應 User 的 username
        UserInfoResponse user = userManagementService.getUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    /**
     * 修改密碼
     */
    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String newPassword) {
        MessageResponse response = userManagementService.resetUserPasswordByUsername(userDetails.getUsername(), newPassword);
        return ResponseEntity.ok(response);
    }
}