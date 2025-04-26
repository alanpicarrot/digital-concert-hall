package com.digitalconcerthall.dto.response;

public class AdminAuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;

    // Constructor
    public AdminAuthResponse(String token, Long id, String username, String email) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
    }

    // Getters
    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}