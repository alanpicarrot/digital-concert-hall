package com.digitalconcerthall;

import com.digitalconcerthall.dto.request.ForgotPasswordRequest;
import com.digitalconcerthall.dto.request.PasswordResetRequest;

public class LombokTest {
    public static void main(String[] args) {
        try {
            // 測試 ForgotPasswordRequest
            ForgotPasswordRequest forgotRequest = new ForgotPasswordRequest();
            forgotRequest.setEmail("test@example.com");
            String email = forgotRequest.getEmail();
            System.out.println("Email: " + email);
    
            // 測試 PasswordResetRequest
            PasswordResetRequest resetRequest = new PasswordResetRequest();
            resetRequest.setToken("test-token");
            resetRequest.setPassword("newpassword");
            String token = resetRequest.getToken();
            String password = resetRequest.getPassword();
            System.out.println("Token: " + token);
            System.out.println("Password: " + password);
            
            System.out.println("\n測試成功！Lombok 或手動實現的 getter/setter 方法正常工作。");
        } catch (Exception e) {
            System.out.println("\n測試失敗！\n錯誤信息: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
