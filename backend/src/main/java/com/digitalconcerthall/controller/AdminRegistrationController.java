package com.digitalconcerthall.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

import jakarta.validation.Valid;

/**
 * 專門處理管理員註冊的控制器
 * 此控制器提供直接註冊管理員的功能，不需要額外的驗證
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping({"/api/admin-register", "/admin-register"})
public class AdminRegistrationController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @PostMapping("/create")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            System.out.println("Received admin registration request: " + signUpRequest);
            
            // 檢查用戶名是否已存在
            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            
            // 檢查郵箱是否已存在
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            
            // 確保所有必要角色存在
            createRoleIfNotExists(ERole.ROLE_USER);
            createRoleIfNotExists(ERole.ROLE_MODERATOR);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            
            // 創建新用戶
            User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword())
            );
            
            user.setFirstName(signUpRequest.getFirstName());
            user.setLastName(signUpRequest.getLastName());
            
            // 設置管理員和用戶角色
            Set<Role> roles = new HashSet<>();
            
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
            roles.add(adminRole);
            
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: User Role is not found."));
            roles.add(userRole);
            
            user.setRoles(roles);
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
        } catch (Exception e) {
            System.err.println("Error during admin registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
