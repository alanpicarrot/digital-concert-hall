package com.digitalconcerthall.dto.response;

import java.time.ZonedDateTime;

public class ErrorResponse {
    private String code;
    private String message;
    private ZonedDateTime timestamp;

    public ErrorResponse(String code, String message, ZonedDateTime timestamp) {
        this.code = code;
        this.message = message;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
}