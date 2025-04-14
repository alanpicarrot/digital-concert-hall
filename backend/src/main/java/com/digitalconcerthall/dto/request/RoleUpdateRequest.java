package com.digitalconcerthall.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class RoleUpdateRequest {
    
    @NotEmpty
    private Set<String> roles;
}
