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
        createTestUsers();
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
        // 檢查是否已經存在測試用戶
        if (!userRepository.existsByUsername("admin")) {
            System.out.println("Creating test users...");
            
            // 創建管理員用戶
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@digitalconcerthall.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setFirstName("系統");
            adminUser.setLastName("管理員");
            
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow());
            adminRoles.add(roleRepository.findByName(ERole.ROLE_USER).orElseThrow());
            adminUser.setRoles(adminRoles);
            
            userRepository.save(adminUser);
            
            // 創建一般用戶
            User regularUser = new User();
            regularUser.setUsername("user");
            regularUser.setEmail("user@digitalconcerthall.com");
            regularUser.setPassword(passwordEncoder.encode("User@123"));
            regularUser.setFirstName("一般");
            regularUser.setLastName("用戶");
            
            Set<Role> userRoles = new HashSet<>();
            userRoles.add(roleRepository.findByName(ERole.ROLE_USER).orElseThrow());
            regularUser.setRoles(userRoles);
            
            userRepository.save(regularUser);
            
            System.out.println("Test users created successfully.");
        } else {
            System.out.println("Test users already exist. Skipping creation.");
        }
    }
}
