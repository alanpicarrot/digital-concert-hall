package com.digitalconcerthall.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequest {
    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
}
