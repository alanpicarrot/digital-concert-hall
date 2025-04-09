package com.digitalconcerthall;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class DigitalConcertHallApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalConcertHallApplication.class, args);
    }
    
    /**
     * 在應用程序啟動時初始化角色和默認管理員帳戶
     */
    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 創建默認角色
            if (roleRepository.count() == 0) {
                System.out.println("創建默認角色...");
                
                Role userRole = new Role(ERole.ROLE_USER);
                Role modRole = new Role(ERole.ROLE_MODERATOR);
                Role adminRole = new Role(ERole.ROLE_ADMIN);
                
                roleRepository.save(userRole);
                roleRepository.save(modRole);
                roleRepository.save(adminRole);
                
                // 創建默認管理員帳戶
                if (userRepository.count() == 0) {
                    System.out.println("創建默認管理員帳戶...");
                    
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setEmail("admin@example.com");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setFirstName("System");
                    admin.setLastName("Admin");
                    
                    Set<Role> roles = new HashSet<>();
                    roles.add(userRole);
                    roles.add(modRole);
                    roles.add(adminRole);
                    admin.setRoles(roles);
                    
                    userRepository.save(admin);
                }
            }
        };
    }
}
