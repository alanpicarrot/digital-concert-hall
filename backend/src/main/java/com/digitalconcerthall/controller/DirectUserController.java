package com.digitalconcerthall.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

/**
 * 直接創建用戶的控制器，不需要認證
 * 這是一個緊急解決方案，用於創建測試帳號
 */
@RestController
@RequestMapping("/direct")
public class DirectUserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 直接創建一個測試用戶
     */
    @GetMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            // 1. 確保角色存在
            createRoleIfNotExists(ERole.ROLE_USER);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            
            // 2. 創建測試用戶
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("test@example.com");
            user.setPassword(passwordEncoder.encode("password123"));
            
            // 如果用戶已存在，則更新它
            if (userRepository.existsByUsername("testuser")) {
                User existingUser = userRepository.findByUsername("testuser").get();
                user.setId(existingUser.getId());
            }
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("User Role not found"));
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin Role not found"));
            
            roles.add(userRole);
            roles.add(adminRole);
            user.setRoles(roles);
            
            userRepository.save(user);
            
            return ResponseEntity.ok("測試用戶創建成功: testuser/password123");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("創建測試用戶失敗: " + e.getMessage());
        }
    }
    
    /**
     * 創建一個特定的用戶
     */
    @GetMapping("/create-user/{username}/{password}")
    public ResponseEntity<?> createUser(@PathVariable String username, @PathVariable String password) {
        try {
            // 1. 確保角色存在
            createRoleIfNotExists(ERole.ROLE_USER);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            
            // 2. 創建用戶
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPassword(passwordEncoder.encode(password));
            
            // 如果用戶已存在，則更新它
            if (userRepository.existsByUsername(username)) {
                User existingUser = userRepository.findByUsername(username).get();
                user.setId(existingUser.getId());
            }
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("User Role not found"));
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin Role not found"));
            
            roles.add(userRole);
            roles.add(adminRole);
            user.setRoles(roles);
            
            userRepository.save(user);
            
            return ResponseEntity.ok("用戶創建成功: " + username + "/" + password);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("創建用戶失敗: " + e.getMessage());
        }
    }
    
    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
