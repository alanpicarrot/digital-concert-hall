package com.digitalconcerthall.controller;

import com.digitalconcerthall.dto.request.PasswordUpdateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;
import com.digitalconcerthall.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600)
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUserInfo() {
        UserInfoResponse userInfo = userService.getCurrentUserInfo();
        return ResponseEntity.ok(userInfo);
    }
    
    @PutMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCurrentUserInfo(@Valid @RequestBody UserUpdateRequest updateRequest) {
        MessageResponse response = userService.updateUserInfo(updateRequest);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/me/password")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody PasswordUpdateRequest passwordUpdateRequest) {
        MessageResponse response = userService.updatePassword(passwordUpdateRequest);
        return ResponseEntity.ok(response);
    }
}
