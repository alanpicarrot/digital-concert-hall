package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.AdminUser;
import com.digitalconcerthall.repository.AdminUserRepository;
import com.digitalconcerthall.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<AdminUserLoginResponse> getAllAdmins() {
        List<AdminUser> admins = adminUserRepository.findAll();
        return admins.stream()
                .map(this::mapToLoginResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserLoginResponse getAdminById(Long id) {
        AdminUser admin = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("管理員不存在，ID: " + id));
        return mapToLoginResponse(admin);
    }

    @Override
    public MessageResponse createAdmin(AdminUserCreateRequest createRequest) {
        if (adminUserRepository.existsByUsername(createRequest.getUsername())) {
            return new MessageResponse("用戶名已被使用!");
        }
        if (adminUserRepository.existsByEmail(createRequest.getEmail())) {
            return new MessageResponse("電子郵件已被使用!");
        }
        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(createRequest.getUsername());
        adminUser.setEmail(createRequest.getEmail());
        adminUser.setPassword(passwordEncoder.encode(createRequest.getPassword()));
        adminUser.setFirstName(createRequest.getFirstName());
        adminUser.setLastName(createRequest.getLastName());
        // 角色設定請依你的需求補充
        adminUserRepository.save(adminUser);
        return new MessageResponse("管理員創建成功!");
    }

    @Override
    public MessageResponse deleteAdmin(Long id) {
        if (!adminUserRepository.existsById(id)) {
            return new MessageResponse("管理員不存在，ID: " + id);
        }
        adminUserRepository.deleteById(id);
        return new MessageResponse("管理員刪除成功!");
    }

    private AdminUserLoginResponse mapToLoginResponse(AdminUser adminUser) {
        // 假設 AdminUser 有 getRoles() 方法，且每個 Role 有 getName().name()
        List<String> roles = adminUser.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new AdminUserLoginResponse(
                "", // accessToken 預設空字串
                "Bearer",
                adminUser.getId(),
                adminUser.getUsername(),
                adminUser.getEmail(),
                roles
        );
    }
}