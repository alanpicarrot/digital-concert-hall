package com.digitalconcerthall.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 100)
    private String firstName;
    
    @Size(max = 100)
    private String lastName;
    
    @Size(max = 50)
    @Email
    private String email;
}
