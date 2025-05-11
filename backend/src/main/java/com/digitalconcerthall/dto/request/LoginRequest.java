package com.digitalconcerthall.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty; // 新增導入
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    @JsonProperty("username") // 確保從 JSON 的 "username" 欄位映射
    private String identifier; // 將 Java 欄位名更改為 identifier

    @NotBlank
    private String password;

    // Getters and Setters 更新為 identifier
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}