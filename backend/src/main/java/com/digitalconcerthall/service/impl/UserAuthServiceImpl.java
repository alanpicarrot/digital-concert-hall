package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.security.jwt.JwtUtils; // 導入你的 JwtUtils
import com.digitalconcerthall.security.services.UserDetailsImpl; // 導入你的 UserDetailsImpl
import com.digitalconcerthall.service.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager; // 導入 AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // 導入
import org.springframework.security.core.Authentication; // 導入
import org.springframework.security.core.context.SecurityContextHolder; // 導入
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Ensure this import
import java.util.HashSet;
import java.util.List; // 導入 List
import java.util.Set;
import java.util.stream.Collectors; // 導入 Collectors

@Service
public class UserAuthServiceImpl implements UserAuthService {

    @Autowired
    private AuthenticationManager authenticationManager; // 注入 AuthenticationManager

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtils jwtUtils; // 注入你的 JwtUtils

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // 1. 使用 AuthenticationManager 進行身份驗證
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword())); // 修改此處

        // 2. 將認證信息設置到 SecurityContextHolder
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. 從認證信息中獲取 UserDetails
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 4. 使用 JwtUtils 生成 JWT 令牌
        String jwt = jwtUtils.generateJwtToken(authentication); // 或者 jwtUtils.generateTokenFromUsername(userDetails.getUsername()); 取決於你的 JwtUtils 實現

        // 5. 獲取用戶角色
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // 6. 創建並返回 JwtResponse
        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles // 使用從 UserDetails 獲取的角色列表
        );
    }

    @Override
    @Transactional // Add this annotation
    public MessageResponse registerUser(SignupRequest signupRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return new MessageResponse("錯誤: 用戶名已被使用!");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new MessageResponse("錯誤: 電子郵件已被使用!");
        }

        // Create new user's account using default constructor and setters
        User user = new User(); // <--- 使用 @NoArgsConstructor 提供的預設建構子
        user.setUsername(signupRequest.getUsername()); // <--- 使用 @Data 提供的 setter
        user.setEmail(signupRequest.getEmail());       // <--- 使用 @Data 提供的 setter
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword())); // <--- 使用 @Data 提供的 setter
        user.setFirstName(signupRequest.getFirstName()); // <--- 使用 @Data 提供的 setter
        user.setLastName(signupRequest.getLastName());   // <--- 使用 @Data 提供的 setter


        // --- Role Handling (Assuming ERole.ROLE_USER exists) ---
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("錯誤: 找不到用戶角色."));
        roles.add(userRole);
        user.setRoles(roles); // <--- 使用 @Data 提供的 setter
        // --- End Role Handling ---

        userRepository.save(user); // Save the user to the database

        return new MessageResponse("用戶註冊成功!");
    }

    @Override
    public MessageResponse registerAdminUser(SignupRequest signupRequest) {
        // 依你的需求實作
        return new MessageResponse("管理員註冊成功!");
    }

    @Override
    public MessageResponse logoutUser() {
        // 依你的需求實作
        return new MessageResponse("登出成功!");
    }

    @Override
    public MessageResponse requestPasswordReset(String email) {
        // 依你的需求實作
        return new MessageResponse("密碼重設郵件已發送!");
    }

    @Override
    public MessageResponse resetPassword(String token, String newPassword) {
        // 依你的需求實作
        return new MessageResponse("密碼已重設!");
    }
}