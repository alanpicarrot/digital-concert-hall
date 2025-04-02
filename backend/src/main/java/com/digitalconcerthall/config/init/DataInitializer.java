package com.digitalconcerthall.config.init;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

/**
 * 初始化數據，包括角色和測試用戶
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initRoles();
        // 已禁用測試用戶創建，只初始化角色
        // createTestUsers();
    }
    
    /**
     * 初始化角色數據
     */
    private void initRoles() {
        // 檢查是否已經存在角色
        if (roleRepository.count() == 0) {
            System.out.println("Initializing roles...");
            
            // 創建用戶角色
            Role userRole = new Role(ERole.ROLE_USER);
            // 創建管理員角色
            Role adminRole = new Role(ERole.ROLE_ADMIN);
            // 創建版主角色
            Role modRole = new Role(ERole.ROLE_MODERATOR);
            
            // 保存角色
            roleRepository.save(userRole);
            roleRepository.save(adminRole);
            roleRepository.save(modRole);
            
            System.out.println("Roles initialized successfully.");
        } else {
            System.out.println("Roles already exist. Skipping initialization.");
        }
    }
    
    /**
     * 創建測試用戶
     */
    private void createTestUsers() {
        // 只建立角色，不自動創建測試用戶
        System.out.println("Test user creation disabled. Please create users manually via API.");
    }
}
