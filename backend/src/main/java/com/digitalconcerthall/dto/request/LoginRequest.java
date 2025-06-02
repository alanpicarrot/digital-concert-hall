package com.digitalconcerthall.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty; // 新增導入
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @JsonProperty("identifier") // 修復：確保從 JSON 的 "identifier" 欄位映射
    private String identifier; // 將 Java 欄位名更改為 identifier

    @JsonProperty("username") // 添加對username字段的支持
    private String username; // 添加username字段

    @NotBlank
    private String password;

    // Getters and Setters 更新為 identifier
    public String getIdentifier() {
        // 如果identifier為空但username不為空，返回username
        return identifier != null ? identifier : username;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

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