package com.digitalconcerthall.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

@RestController
@RequestMapping("/setup")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/init")
    public ResponseEntity<?> init() {
        // 確保角色存在
        createRoleIfNotExists(ERole.ROLE_USER);
        createRoleIfNotExists(ERole.ROLE_MODERATOR);
        createRoleIfNotExists(ERole.ROLE_ADMIN);
        
        // 創建測試用戶
        createTestUser();
        
        return ResponseEntity.ok("系統初始化完成: 測試用戶 (testuser/password123) 創建成功");
    }
    
    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
    
    private void createTestUser() {
        if (!userRepository.existsByUsername("testuser")) {
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("test@example.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName("Test");
            user.setLastName("User");
            
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(userRole);
            user.setRoles(roles);
            
            userRepository.save(user);
        }
    }
}
