package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.MessageResponse;

/**
 * 專用於處理系統的第一個管理員註冊的服務
 * 這個服務允許在系統初始化時手動註冊第一個管理員，該管理員將繞過一些後續註冊才需要的認證邏輯
 */
public interface FirstAdminService {
    
    /**
     * 檢查是否系統中沒有管理員（首次設置）
     * @return true如果沒有管理員，false如果已有管理員
     */
    boolean isFirstAdmin();
    
    /**
     * 註冊第一個管理員帳號
     * 此方法將允許繞過某些後續註冊時必要的驗證邏輯，例如電子郵件確認、額外的密碼強度檢查等
     * 只有在系統中沒有管理員時才可使用此方法
     * @param signupRequest 註冊請求
     * @return 註冊結果訊息
     */
    MessageResponse registerFirstAdmin(SignupRequest signupRequest);
}
