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
 * 實現第一位管理員註冊服務的類別
 * 此服務允許在系統初始化時手動註冊第一位管理員
 * 此管理員將繞過部分既有的驗證邏輯
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
        // 檢查 admin_users 資料表是否有資料
        return adminUserRepository.count() == 0;
    }

    @Override
    @Transactional
    public MessageResponse registerFirstAdmin(AdminUserCreateRequest signUpRequest) {
        if (!isFirstAdmin()) {
            return new MessageResponse("錯誤：系統已經有管理員！");
        }

        if (adminUserRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("錯誤：用戶名已被使用！");
        }

        if (adminUserRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("錯誤：電子郵件已被使用！");
        }

        // 確保角色存在
        createRoleIfNotExists(ERole.ROLE_ADMIN);

        // 設定管理員角色
        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到管理員角色。"));
        roles.add(adminRole);

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(signUpRequest.getUsername());
        adminUser.setEmail(signUpRequest.getEmail());
        adminUser.setPassword(encoder.encode(signUpRequest.getPassword()));
        adminUser.setFirstName(signUpRequest.getFirstName());
        adminUser.setLastName(signUpRequest.getLastName());
        adminUser.setRoles(roles);

        adminUserRepository.save(adminUser);

        return new MessageResponse("第一位管理員註冊成功！");
    }

    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }
}
