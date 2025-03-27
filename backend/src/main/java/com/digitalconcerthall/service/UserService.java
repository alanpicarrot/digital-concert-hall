package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.PasswordUpdateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;

import com.digitalconcerthall.model.User;

public interface UserService {
    UserInfoResponse getCurrentUserInfo();
    MessageResponse updateUserInfo(UserUpdateRequest updateRequest);
    MessageResponse updatePassword(PasswordUpdateRequest passwordUpdateRequest);
    User getCurrentUser();
}
