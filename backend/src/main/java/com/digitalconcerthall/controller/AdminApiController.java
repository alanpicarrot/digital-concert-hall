package com.digitalconcerthall.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 管理員API控制器，用於直接創建管理員用戶
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping({"/api/direct", "/direct"})
public class AdminApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 直接創建測試用戶
     */
    @GetMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            // 確保角色存在
            createRoleIfNotExists(ERole.ROLE_USER);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            
            // 創建測試用戶
            String username = "testuser";
            String email = "testuser@example.com";
            String password = "password123";
            
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.ok(new MessageResponse("測試用戶 testuser 已存在!"));
            }
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_USER).orElseThrow());
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow());
            user.setRoles(roles);
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("測試用戶創建成功: " + username + " / " + password));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("創建失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 直接創建指定用戶
     */
    @GetMapping("/create-user/{username}/{password}")
    public ResponseEntity<?> createUser(@PathVariable String username, @PathVariable String password) {
        try {
            // 確保角色存在
            createRoleIfNotExists(ERole.ROLE_USER);
            createRoleIfNotExists(ERole.ROLE_ADMIN);
            
            // 創建用戶
            String email = username + "@example.com";
            
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.ok(new MessageResponse("用戶 " + username + " 已存在!"));
            }
            
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_USER).orElseThrow());
            
            // 如果是admin用戶, 添加管理員角色
            if ("admin".equals(username)) {
                roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow());
            }
            
            user.setRoles(roles);
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("用戶創建成功: " + username + " / " + password));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("創建失敗: " + e.getMessage()));
        }
    }
    
    /**
     * 如果角色不存在則創建
     */
    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
