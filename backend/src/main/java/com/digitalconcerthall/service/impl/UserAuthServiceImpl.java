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
import org.slf4j.Logger; // Import SLF4J Logger
import org.slf4j.LoggerFactory; // Import SLF4J LoggerFactory
import java.util.HashSet;
import java.util.List; // 導入 List
import java.util.Set;
import java.util.stream.Collectors; // 導入 Collectors
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

@Service
public class UserAuthServiceImpl implements UserAuthService {

    private static final Logger logger = LoggerFactory.getLogger(UserAuthServiceImpl.class); // Define logger

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

    @Autowired
    private DaoAuthenticationProvider userAuthenticationProvider;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = userAuthenticationProvider.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> contextAuthorities = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList());
        logger.info("UserAuthServiceImpl: User '{}' authenticated. Authorities from SecurityContext principal: {}",
                userDetails.getUsername(), contextAuthorities);
        String jwt = jwtUtils.generateJwtToken(authentication);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles);
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
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());

        // 設定帳號啟用
        user.setEnabled(true);

        // --- Role Handling (只給 ROLE_USER) ---
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("錯誤: 找不到用戶角色."));
        roles.add(userRole);
        user.setRoles(roles);
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