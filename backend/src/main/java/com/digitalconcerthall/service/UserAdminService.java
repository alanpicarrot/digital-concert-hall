package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.RoleUpdateRequest;
import com.digitalconcerthall.dto.request.UserCreateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;

import java.util.List;

public interface UserAdminService {
    List<UserInfoResponse> getAllUsers();
    
    UserInfoResponse getUserById(Long id);
    
    MessageResponse createUser(UserCreateRequest createRequest);
    
    MessageResponse updateUser(Long id, UserUpdateRequest updateRequest);
    
    MessageResponse updateUserRoles(Long id, RoleUpdateRequest roleRequest);
    
    MessageResponse resetUserPassword(Long id, String newPassword);
    
    MessageResponse deleteUser(Long id);
}
