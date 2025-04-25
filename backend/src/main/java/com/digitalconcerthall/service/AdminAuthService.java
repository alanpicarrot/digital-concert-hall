package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;

public interface AdminAuthService {
    AdminUserLoginResponse authenticateAdmin(LoginRequest loginRequest);
    MessageResponse registerAdmin(AdminUserCreateRequest signUpRequest);
}