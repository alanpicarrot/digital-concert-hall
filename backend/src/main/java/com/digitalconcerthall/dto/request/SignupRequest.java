package com.digitalconcerthall.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "用戶名不得空白")
    @Size(min = 3, max = 20, message = "用戶名必須在 3 至 20 個字符之間")
    private String username;

    @NotBlank(message = "電子郵件不得空白")
    @Size(max = 50, message = "電子郵件最多為 50 個字符")
    @Email(message = "電子郵件格式不正確")
    private String email;

    private Set<String> role;

    @NotBlank(message = "密碼不得空白")
    @Size(min = 6, max = 40, message = "密碼必須在 6 至 40 個字符之間")
    private String password;
    
    @Size(max = 100, message = "名字最多為 100 個字符")
    private String firstName;
    
    @Size(max = 100, message = "姓氏最多為 100 個字符")
    private String lastName;

    // 自定義方法使應用更易於除錯
    @Override
    public String toString() {
        return "SignupRequest{" +
                "username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", password='[PROTECTED]'" +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                '}';
    }
}
