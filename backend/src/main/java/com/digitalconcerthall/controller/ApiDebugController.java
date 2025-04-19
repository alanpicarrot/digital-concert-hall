package com.digitalconcerthall.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API Debug Controller - For debugging API security and authentication issues
 * These endpoints are publicly accessible even in production
 */
@RestController
@RequestMapping("/api/debug")
public class ApiDebugController {
    
    private static final Logger logger = LoggerFactory.getLogger(ApiDebugController.class);
    
    /**
     * 檢查API認證狀態端點
     */
    @GetMapping("/auth-status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            response.put("authenticated", auth.isAuthenticated());
            response.put("principal_type", auth.getPrincipal().getClass().getName());
            response.put("authorities", auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList()));
            
            logger.debug("API Debug auth-status: {}", response);
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found in security context");
            logger.warn("API Debug auth-status: No authentication in context");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 簡單的健康檢查端點
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "API Debug controller is working");
        return ResponseEntity.ok(status);
    }
}
