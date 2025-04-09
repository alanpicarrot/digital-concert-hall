package com.digitalconcerthall.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
