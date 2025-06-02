package com.digitalconcerthall.security.services;

import com.digitalconcerthall.model.AdminUser; // 假設您有 AdminUser 模型
import com.digitalconcerthall.repository.AdminUserRepository; // 假設您有 AdminUserRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AdminUserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserDetailsServiceImpl.class);

    @Autowired
    AdminUserRepository adminUserRepository; // 注入 AdminUserRepository

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("AdminUserDetailsServiceImpl: Attempting to load admin user with username: {}", username);

        // 根據 username 查找 AdminUser
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("AdminUserDetailsServiceImpl: Admin User Not Found with username: {}", username);
                    return new UsernameNotFoundException("Admin User Not Found with username: " + username);
                });

        logger.info("AdminUserDetailsServiceImpl: Successfully found admin user: {}, roles: {}",
                adminUser.getUsername(), adminUser.getRoles());

        // 使用 AdminUserDetailsImpl 構建 UserDetails 對象
        return AdminUserDetailsImpl.build(adminUser);
    }

    // 您可以根據需要添加其他方法，例如 loadUserById
    @Transactional
    public UserDetails loadAdminUserById(Long id) throws UsernameNotFoundException {
        logger.info("AdminUserDetailsServiceImpl: Attempting to load admin user with id: {}", id);

        AdminUser adminUser = adminUserRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("AdminUserDetailsServiceImpl: Admin User Not Found with id: {}", id);
                    return new UsernameNotFoundException("Admin User Not Found with id: " + id);
                });

        logger.info("AdminUserDetailsServiceImpl: Successfully found admin user by id: {}", adminUser.getUsername());
        return AdminUserDetailsImpl.build(adminUser);
    }
}