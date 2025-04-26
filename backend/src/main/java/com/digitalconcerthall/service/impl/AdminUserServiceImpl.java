package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.AdminUser;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.repository.AdminUserRepository;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private RoleRepository roleRepository;

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
        
        // 處理角色設定
        Set<String> strRoles = createRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            // 預設為 ROLE_ADMIN
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("錯誤: 找不到管理員角色"));
            roles.add(adminRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("錯誤: 找不到管理員角色"));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                            .orElseThrow(() -> new RuntimeException("錯誤: 找不到版主角色"));
                        roles.add(modRole);
                        break;
                    case "user":
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                            .orElseThrow(() -> new RuntimeException("錯誤: 找不到用戶角色"));
                        roles.add(userRole);
                        break;
                    default:
                        throw new RuntimeException("錯誤: 不支援的角色類型 " + role);
                }
            });
        }

        adminUser.setRoles(roles);
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
        // 獲取用戶角色
        List<String> roles = adminUser.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new AdminUserLoginResponse(
                "", // accessToken 預設空字串
                adminUser.getId(),
                adminUser.getUsername(),
                adminUser.getEmail(),
                roles
        );
    }
}