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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashSet;
import java.util.Set;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 創建必要的角色
        initRoles();
        
        // 創建管理員帳號
        initAdminUser();
        
        // 創建測試用戶
        initTestUsers();
    }
    
    private void initRoles() {
        System.out.println("初始化角色...");
        
        // 確保所有處帶存在
        if (!roleRepository.existsByName(ERole.ROLE_USER)) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            System.out.println("創建了 ROLE_USER 角色");
        }
        
        if (!roleRepository.existsByName(ERole.ROLE_MODERATOR)) {
            roleRepository.save(new Role(ERole.ROLE_MODERATOR));
            System.out.println("創建了 ROLE_MODERATOR 角色");
        }
        
        if (!roleRepository.existsByName(ERole.ROLE_ADMIN)) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("創建了 ROLE_ADMIN 角色");
        }
    }
    
    private void initAdminUser() {
        // 定義管理員帳號的帳號資訊
        String adminUsername = "admin";
        String adminEmail = "admin@digitalconcert.com";
        String adminPassword = "password123";
        
        // 檢查管理員帳號是否已存在
        if (userRepository.findByUsername(adminUsername).isPresent() || 
            userRepository.findByEmail(adminEmail).isPresent()) {
            System.out.println("管理員帳號已存在，跳過初始化");
        } else {
            System.out.println("初始化管理員帳號...");
            
            // 創建管理員帳號
            User adminUser = new User();
            adminUser.setUsername(adminUsername);
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            
            // 設置角色
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
            roles.add(adminRole);
            
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: User Role is not found."));
            roles.add(userRole);
            
            adminUser.setRoles(roles);
            
            userRepository.save(adminUser);
            System.out.println("管理員帳號創建成功：" + adminUsername + " (密碼: " + adminPassword + ")");
        }
    }
    
    private void initTestUsers() {
        // 創建測試用戶
        createTestUser("testuser", "testuser@example.com", "password123", "Test", "User", false);
        createTestUser("test", "test@example.com", "password123", "Test", "Admin", true);
    }
    
    private void createTestUser(String username, String email, String password, String firstName, String lastName, boolean isAdmin) {
        if (userRepository.findByUsername(username).isPresent() || 
            userRepository.findByEmail(email).isPresent()) {
            System.out.println("測試用戶 " + username + " 已存在，跳過初始化");
            return;
        }
        
        User testUser = new User();
        testUser.setUsername(username);
        testUser.setEmail(email);
        testUser.setPassword(passwordEncoder.encode(password));
        testUser.setFirstName(firstName);
        testUser.setLastName(lastName);
        
        Set<Role> roles = new HashSet<>();
        
        // 添加基本用戶角色
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: User Role is not found."));
        roles.add(userRole);
        
        // 如果是管理員，添加管理員角色
        if (isAdmin) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
            roles.add(adminRole);
        }
        
        testUser.setRoles(roles);
        userRepository.save(testUser);
        
        System.out.println("測試用戶創建成功：" + username + " (密碼: " + password + ")" + 
                          (isAdmin ? " [管理員]" : ""));
    }
}