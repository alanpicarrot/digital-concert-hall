package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);

    MessageResponse registerUser(SignupRequest signupRequest);

    MessageResponse registerAdminUser(SignupRequest signupRequest); // 新增的管理員註冊方法

    MessageResponse logoutUser();

    MessageResponse requestPasswordReset(String email);

    MessageResponse resetPassword(String token, String newPassword);
}