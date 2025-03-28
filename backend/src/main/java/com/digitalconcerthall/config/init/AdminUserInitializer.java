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
        // 檢查管理員帳號是否已存在
        if (userRepository.findByEmail("admin@digitalconcert.com").isPresent()) {
            System.out.println("管理員帳號已存在，跳過初始化");
            return;
        }

        System.out.println("初始化管理員帳號...");

        // 確保 ROLE_ADMIN 角色存在
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role newRole = new Role(ERole.ROLE_ADMIN);
                    return roleRepository.save(newRole);
                });

        // 創建管理員帳號
        User adminUser = new User();
        adminUser.setUsername("admin@digitalconcert.com"); // 使用 email 作為 username
        adminUser.setEmail("admin@digitalconcert.com");
        adminUser.setPassword(passwordEncoder.encode("Admin@123!"));
        
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        adminUser.setRoles(roles);

        userRepository.save(adminUser);
        System.out.println("管理員帳號創建成功：admin@digitalconcert.com");
    }
}