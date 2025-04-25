package com.digitalconcerthall.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.UserDetailsImpl;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 測試認證相關的控制器，用於診斷 JWT 令牌和認證問題
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600)
@RestController
@RequestMapping("/api/test-auth")
public class TestAuthController {
    private static final Logger logger = LoggerFactory.getLogger(TestAuthController.class);
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * 測試當前認證狀態
     */
    @GetMapping("/status")
    public ResponseEntity<?> testAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null) {
            response.put("authenticated", auth.isAuthenticated());
            response.put("principal_type", auth.getPrincipal().getClass().getName());
            response.put("authorities", auth.getAuthorities());
            
            if (auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", userDetails.getId());
                userInfo.put("username", userDetails.getUsername());
                userInfo.put("email", userDetails.getEmail());
                response.put("user_details", userInfo);
            }
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found in SecurityContext");
        }
        
        // 檢查請求頭
        Map<String, String> headers = getRequestHeaders();
        response.put("headers", headers);
        
        // 如果有 JWT 令牌，檢查其內容
        String authHeader = headers.get("authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                Map<String, Object> tokenInfo = new HashMap<>();
                tokenInfo.put("valid", jwtUtils.validateJwtToken(jwt));
                tokenInfo.put("username", jwtUtils.getUserNameFromJwtToken(jwt));
                tokenInfo.put("roles", jwtUtils.getRolesFromJwtToken(jwt));
                tokenInfo.put("user_id", jwtUtils.getUserIdFromJwtToken(jwt));
                response.put("token_info", tokenInfo);
            } catch (Exception e) {
                Map<String, Object> tokenError = new HashMap<>();
                tokenError.put("error", e.getClass().getSimpleName());
                tokenError.put("message", e.getMessage());
                response.put("token_error", tokenError);
            }
        }
        
        logger.info("Auth test response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 獲取所有請求頭
     */
    private Map<String, String> getRequestHeaders() {
        Map<String, String> headers = new HashMap<>();
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                
                // 保護敏感信息，只顯示令牌的一部分
                if (headerName.equalsIgnoreCase("authorization") && headerValue != null && headerValue.length() > 20) {
                    headers.put(headerName.toLowerCase(), headerValue.substring(0, 20) + "...");
                } else {
                    headers.put(headerName.toLowerCase(), headerValue);
                }
            }
        } catch (Exception e) {
            headers.put("error", "Could not retrieve headers: " + e.getMessage());
        }
        return headers;
    }
}