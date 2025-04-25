package com.digitalconcerthall;

import com.digitalconcerthall.model.AdminUser;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role; // Assuming Role entity exists
import com.digitalconcerthall.repository.AdminUserRepository;
import com.digitalconcerthall.repository.RoleRepository; // Assuming RoleRepository exists
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class DigitalConcertHallApplication {

	public static void main(String[] args) {
		SpringApplication.run(DigitalConcertHallApplication.class, args);
	}

	// Bean to initialize database with superuser if not exists
	@Bean
	CommandLineRunner initDatabase(AdminUserRepository adminUserRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String superUsername = "superuser";
			String superPassword = "DefaultPassword123!"; // 請務必在生產環境中使用更安全的密碼或配置方式
			String superEmail = "superuser@example.com"; // 可以是假 Email

			// 檢查超級使用者是否已存在
			if (!adminUserRepository.existsByUsername(superUsername)) {
				System.out.println("Creating superuser: " + superUsername);

				AdminUser superUser = new AdminUser();
				superUser.setUsername(superUsername);
				superUser.setEmail(superEmail);
				superUser.setPassword(passwordEncoder.encode(superPassword));

				// 查找或創建 ROLE_ADMIN 角色
				Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
						.orElseGet(() -> {
							Role newRole = new Role(ERole.ROLE_ADMIN);
							return roleRepository.save(newRole);
						});

				// 查找或創建 ROLE_USER 角色 (如果需要的話，根據您的 ERole 定義)
				// Role userRole = roleRepository.findByName(ERole.ROLE_USER)
				// 		.orElseGet(() -> {
				// 			Role newRole = new Role(ERole.ROLE_USER);
				// 			return roleRepository.save(newRole);
				// 		});

				Set<Role> roles = new HashSet<>();
				roles.add(adminRole);
				// roles.add(userRole); // 如果超級使用者也需要 USER 角色

				superUser.setRoles(roles);
				adminUserRepository.save(superUser);
				System.out.println("Superuser " + superUsername + " created successfully.");
			} else {
				System.out.println("Superuser " + superUsername + " already exists.");
			}
		};
	}
}
