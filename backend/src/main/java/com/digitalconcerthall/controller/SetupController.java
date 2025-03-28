package com.digitalconcerthall.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

/**
 * 系統設置控制器，用於初始化系統和創建測試帳號
 */
@RestController
@RequestMapping("/setup")
public class SetupController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 初始化系統，創建必要的角色和測試用戶
     */
    @GetMapping({"/init", "/admin-init"})
    public ResponseEntity<?> initSystem() {
        StringBuilder resultMessage = new StringBuilder("系統初始化結果:\n");

        try {
            // 1. 創建角色
            createRoleIfNotExists(ERole.ROLE_USER, resultMessage);
            createRoleIfNotExists(ERole.ROLE_MODERATOR, resultMessage);
            createRoleIfNotExists(ERole.ROLE_ADMIN, resultMessage);

            // 2. 創建測試用戶 (使用用戶名)
            createTestUserIfNotExists("testuser", "test@example.com", "password123", 
                    Set.of(ERole.ROLE_USER, ERole.ROLE_ADMIN), resultMessage);

            // 3. 創建管理員帳號
            createTestUserIfNotExists("admin", "admin@example.com", "admin123", 
                    Set.of(ERole.ROLE_ADMIN), resultMessage);

            return ResponseEntity.ok(new MessageResponse(resultMessage.toString()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("初始化失敗: " + e.getMessage()));
        }
    }

    /**
     * 如果角色不存在則創建
     */
    private void createRoleIfNotExists(ERole roleName, StringBuilder message) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
            message.append("已創建角色: ").append(roleName).append("\n");
        } else {
            message.append("角色已存在: ").append(roleName).append("\n");
        }
    }

    /**
     * 如果用戶不存在則創建測試用戶
     */
    private void createTestUserIfNotExists(String username, String email, String password, 
            Set<ERole> roleNames, StringBuilder message) {
        
        if (userRepository.existsByUsername(username)) {
            message.append("用戶名已存在: ").append(username).append("\n");
        } else if (userRepository.existsByEmail(email)) {
            message.append("電子郵件已存在: ").append(email).append("\n");
        } else {
            // 創建用戶
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            for (ERole roleName : roleNames) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("角色不存在: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
            
            userRepository.save(user);
            message.append("已創建用戶: ").append(username).append(" (").append(email).append(")\n");
        }
    }
}
