package com.digitalconcerthall.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.service.FirstAdminService;

@Service
/**
 * 实现第一个管理员注册服务的类
 * 该服务允许在系统初始化时手动注册第一个管理员
 * 该管理员将绕过一些已存在的验证逻辑
 */
public class FirstAdminServiceImpl implements FirstAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public boolean isFirstAdmin() {
        // 檢查是否存在具有ADMIN角色的用戶
        
        // 首先確認角色表中是否存在ADMIN角色
        if (!roleRepository.existsByName(ERole.ROLE_ADMIN)) {
            // 角色表中不存在ADMIN角色，肯定沒有管理員
            return true;
        }
        
        // 獲取ADMIN角色
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
        
        // 檢查是否有用戶具有此角色
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (user.getRoles().contains(adminRole)) {
                // 存在具有ADMIN角色的用戶
                return false;
            }
        }
        
        // 沒有找到具有ADMIN角色的用戶
        return true;
    }

    @Override
    @Transactional
    public MessageResponse registerFirstAdmin(SignupRequest signUpRequest) {
        // 再次檢查是否是首次註冊
        if (!isFirstAdmin()) {
            return new MessageResponse("Error: System already has an admin!");
        }
        
        // 即使是第一個管理員也需要檢查基本資料，只繞過特定的認證邏輯
        // 檢查用戶名是否已存在
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        // 檢查郵箱是否已存在
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }
        
        // 對於第一個管理員，不需要執行額外的驗證邏輯
        // 例如：電子郵件確認、密碼強度要求或其他額外的安全檢查

        // 創建新用戶帳號
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        // 確保角色存在
        createRoleIfNotExists(ERole.ROLE_USER);
        createRoleIfNotExists(ERole.ROLE_MODERATOR);
        createRoleIfNotExists(ERole.ROLE_ADMIN);

        // 設置為管理員和普通用戶角色
        Set<Role> roles = new HashSet<>();
        
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
        roles.add(adminRole);
        
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: User Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("First admin user registered successfully!");
    }
    
    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
