package com.digitalconcerthall.dto.request;

import java.io.Serializable;
import jakarta.validation.constraints.NotBlank;

public class AdminLoginRequest implements Serializable {
    // 建議添加序列化版本UID
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "用戶名不能為空")
    private String username;

    @NotBlank(message = "密碼不能為空")
    private String password;

    // 添加無參數構造函數
    public AdminLoginRequest() {}

    // 建議添加全參數構造函數
    public AdminLoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

