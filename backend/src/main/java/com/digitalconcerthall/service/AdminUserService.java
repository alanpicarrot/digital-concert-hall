package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;

import java.util.List;

public interface AdminUserService {
    List<AdminUserLoginResponse> getAllAdmins();

    AdminUserLoginResponse getAdminById(Long id);

    MessageResponse createAdmin(AdminUserCreateRequest createRequest);

    MessageResponse deleteAdmin(Long id);

    // 你可以根據需求擴充更多方法，例如修改密碼、修改角色等
}