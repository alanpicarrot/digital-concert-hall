package com.digitalconcerthall.controller.admin;

import com.digitalconcerthall.dto.request.RoleUpdateRequest;
import com.digitalconcerthall.dto.request.UserCreateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;
import com.digitalconcerthall.service.UserAdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {
    
    @Autowired
    private UserAdminService userAdminService;
    
    /**
     * 獲取所有用戶
     */
    @GetMapping
    public ResponseEntity<List<UserInfoResponse>> getAllUsers() {
        List<UserInfoResponse> users = userAdminService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * 獲取特定用戶
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserInfoResponse> getUserById(@PathVariable Long id) {
        UserInfoResponse user = userAdminService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    /**
     * 創建新用戶
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateRequest createRequest) {
        MessageResponse response = userAdminService.createUser(createRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 更新用戶信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest updateRequest) {
        MessageResponse response = userAdminService.updateUser(id, updateRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 更新用戶角色
     */
    @PutMapping("/{id}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest roleRequest) {
        MessageResponse response = userAdminService.updateUserRoles(id, roleRequest);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 更改用戶密碼
     */
    @PutMapping("/{id}/password-reset")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestParam String newPassword) {
        MessageResponse response = userAdminService.resetUserPassword(id, newPassword);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 刪除用戶
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        MessageResponse response = userAdminService.deleteUser(id);
        return ResponseEntity.ok(response);
    }
}
