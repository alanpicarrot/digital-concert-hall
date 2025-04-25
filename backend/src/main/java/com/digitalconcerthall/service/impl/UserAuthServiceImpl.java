package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.service.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAuthServiceImpl implements UserAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("密碼錯誤");
        }

        // 這裡應該產生 accessToken，這裡僅為範例
        String accessToken = "mocked-access-token";
        return new JwtResponse(
                accessToken,
                user.getId(),
                user.getUsername(),
                user.getRoles().stream().map(role -> role.getName().name()).toList()
        );
    }

    @Override
    public MessageResponse registerUser(SignupRequest signupRequest) {
        // 依你的需求實作
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