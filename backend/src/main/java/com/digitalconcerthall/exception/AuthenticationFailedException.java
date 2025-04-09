package com.digitalconcerthall.exception;

/**
 * 认证失败异常
 */
public class AuthenticationFailedException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    public AuthenticationFailedException(String message) {
        super(message);
    }
    
    public AuthenticationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
