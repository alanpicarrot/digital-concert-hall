package com.digitalconcerthall.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.AdminUser;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.AdminUserRepository;
import com.digitalconcerthall.service.FirstAdminService;

@Service
/**
 * 实现第一个管理员注册服务的类
 * 该服务允许在系统初始化时手动注册第一个管理员
 * 该管理员将绕过一些已存在的验证逻辑
 */
public class FirstAdminServiceImpl implements FirstAdminService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public boolean isFirstAdmin() {
        // 检查 admin_users 表是否有数据
        return adminUserRepository.count() == 0;
    }

    @Override
    @Transactional
    public MessageResponse registerFirstAdmin(AdminUserCreateRequest signUpRequest) {
        if (!isFirstAdmin()) {
            return new MessageResponse("Error: System already has an admin!");
        }

        if (adminUserRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        if (adminUserRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // 确保角色存在
        createRoleIfNotExists(ERole.ROLE_ADMIN);

        // 设置管理员角色
        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
        roles.add(adminRole);

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(signUpRequest.getUsername());
        adminUser.setEmail(signUpRequest.getEmail());
        adminUser.setPassword(encoder.encode(signUpRequest.getPassword()));
        adminUser.setFirstName(signUpRequest.getFirstName());
        adminUser.setLastName(signUpRequest.getLastName());
        adminUser.setRoles(roles);

        adminUserRepository.save(adminUser);

        return new MessageResponse("First admin user registered successfully!");
    }

    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
