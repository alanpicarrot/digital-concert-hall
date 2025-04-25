package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.RoleUpdateRequest;
import com.digitalconcerthall.dto.request.UserCreateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;

import java.util.List;

public interface UserManagementService {
    List<UserInfoResponse> getAllUsers();

    UserInfoResponse getUserById(Long id);

    UserInfoResponse getUserByUsername(String username);

    MessageResponse resetUserPasswordByUsername(String username, String newPassword);

    MessageResponse createUser(UserCreateRequest createRequest);

    MessageResponse updateUser(Long id, UserUpdateRequest updateRequest);

    MessageResponse updateUserRoles(Long id, RoleUpdateRequest roleRequest);

    MessageResponse resetUserPassword(Long id, String newPassword);

    MessageResponse deleteUser(Long id);
}