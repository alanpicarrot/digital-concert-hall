package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.RoleUpdateRequest;
import com.digitalconcerthall.dto.request.UserCreateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.service.UserAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserAdminServiceImpl implements UserAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserInfoResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapUserToUserInfoResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserInfoResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用戶不存在，ID: " + id));
        
        return mapUserToUserInfoResponse(user);
    }

    @Override
    @Transactional
    public MessageResponse createUser(UserCreateRequest createRequest) {
        // 檢查用戶名和郵箱是否已存在
        if (userRepository.existsByUsername(createRequest.getUsername())) {
            return new MessageResponse("用戶名已被使用!");
        }

        if (userRepository.existsByEmail(createRequest.getEmail())) {
            return new MessageResponse("電子郵件已被使用!");
        }

        // 創建新用戶
        User user = new User();
        user.setUsername(createRequest.getUsername());
        user.setEmail(createRequest.getEmail());
        user.setPassword(passwordEncoder.encode(createRequest.getPassword()));
        user.setFirstName(createRequest.getFirstName());
        user.setLastName(createRequest.getLastName());

        // 設置用戶角色
        Set<Role> roles = new HashSet<>();
        
        if (createRequest.getRoles() == null || createRequest.getRoles().isEmpty()) {
            // 默認添加用戶角色
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("未找到用戶角色"));
            roles.add(userRole);
        } else {
            createRequest.getRoles().forEach(roleName -> {
                switch (roleName) {
                    case "ADMIN":
                    case "admin":
                    case "ROLE_ADMIN":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("未找到管理員角色"));
                        roles.add(adminRole);
                        break;
                    case "MODERATOR":
                    case "moderator":
                    case "ROLE_MODERATOR":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("未找到版主角色"));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("未找到用戶角色"));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("用戶創建成功!");
    }

    @Override
    @Transactional
    public MessageResponse updateUser(Long id, UserUpdateRequest updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用戶不存在，ID: " + id));

        // 如果要更新郵箱，檢查是否已存在
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                return new MessageResponse("電子郵件已被使用!");
            }
            user.setEmail(updateRequest.getEmail());
        }

        // 更新其他信息
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }

        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }

        userRepository.save(user);
        return new MessageResponse("用戶信息更新成功!");
    }

    @Override
    @Transactional
    public MessageResponse updateUserRoles(Long id, RoleUpdateRequest roleRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用戶不存在，ID: " + id));

        Set<Role> roles = new HashSet<>();
        
        roleRequest.getRoles().forEach(roleName -> {
            switch (roleName) {
                case "ADMIN":
                case "admin":
                case "ROLE_ADMIN":
                    Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("未找到管理員角色"));
                    roles.add(adminRole);
                    break;
                case "MODERATOR":
                case "moderator":
                case "ROLE_MODERATOR":
                    Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                            .orElseThrow(() -> new RuntimeException("未找到版主角色"));
                    roles.add(modRole);
                    break;
                case "USER":
                case "user":
                case "ROLE_USER":
                    Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                            .orElseThrow(() -> new RuntimeException("未找到用戶角色"));
                    roles.add(userRole);
                    break;
                default:
                    throw new RuntimeException("無效的角色: " + roleName);
            }
        });

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("用戶角色更新成功!");
    }

    @Override
    @Transactional
    public MessageResponse resetUserPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用戶不存在，ID: " + id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new MessageResponse("用戶密碼重置成功!");
    }

    @Override
    @Transactional
    public MessageResponse deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return new MessageResponse("用戶不存在，ID: " + id);
        }

        userRepository.deleteById(id);
        return new MessageResponse("用戶刪除成功!");
    }

    /**
     * 將User實體映射為UserInfoResponse DTO
     */
    private UserInfoResponse mapUserToUserInfoResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles
        );
    }
}
