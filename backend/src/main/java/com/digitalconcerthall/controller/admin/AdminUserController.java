package com.digitalconcerthall.controller.admin;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.request.RoleUpdateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/admin-users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserLoginResponse>> getAllAdmins() {
        List<AdminUserLoginResponse> admins = adminUserService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserLoginResponse> getAdminById(@PathVariable Long id) {
        AdminUserLoginResponse admin = adminUserService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }

    @PostMapping
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminUserCreateRequest createRequest) {
        MessageResponse response = adminUserService.createAdmin(createRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<?> updateAdminRoles(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest roleRequest) {
        // 若有設計對應方法可加上
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        MessageResponse response = adminUserService.deleteAdmin(id);
        return ResponseEntity.ok(response);
    }
}