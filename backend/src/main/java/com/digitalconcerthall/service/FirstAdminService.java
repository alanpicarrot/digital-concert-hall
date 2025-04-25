package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;

/**
 * 專用於處理系統的第一個管理員註冊的服務
 * 這個服務允許在系統初始化時手動註冊第一個管理員，該管理員將繞過一些後續註冊才需要的認證邏輯
 */
public interface FirstAdminService {

    boolean isFirstAdmin();

    MessageResponse registerFirstAdmin(AdminUserCreateRequest signupRequest);
}
