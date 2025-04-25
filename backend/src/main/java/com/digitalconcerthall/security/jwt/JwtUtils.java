package com.digitalconcerthall.security.jwt;

import com.digitalconcerthall.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        // 獲取用戶角色列表
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        // 記錄生成的令牌信息
        logger.debug("Generating JWT token for user: {}, roles: {}, id: {}", 
                 userPrincipal.getUsername(), roles, userPrincipal.getId());
        
        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                // 添加角色信息到 claims 中
                .claim("roles", roles)
                // 添加用戶ID到claims中，確保在令牌中包含用戶ID
                .claim("userId", userPrincipal.getId())
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
    
    // 增加從JWT中獲取用戶ID的方法
    public Long getUserIdFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(token).getBody();
    
            // 更通用的寫法，避免型別不一致
            Number userId = claims.get("userId", Number.class);
            if (userId != null) {
                return userId.longValue();
            }
            return null;
        } catch (Exception e) {
            logger.error("Error extracting userId from JWT token: {}", e.getMessage());
            return null;
        }
    }
    
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromJwtToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(token).getBody();
            List<String> roles = (List<String>) claims.get("roles");
            
            // 記錄提取到的角色信息
            logger.debug("Raw roles from JWT: {}", roles);
            
            if (roles == null) {
                logger.warn("No roles found in JWT token");
                return List.of(); // 返回空列表而不是 null
            }
            
            // 確保角色格式正確 (Spring Security 期望 'ROLE_USER' 格式)
            List<String> formattedRoles = roles.stream()
                .map(role -> {
                    // 轉換為字符串來確保安全
                    String roleStr = role.toString();
                    
                    // 如果角色已經是 ROLE_ 開頭的，則保留原樣
                    if (roleStr.startsWith("ROLE_")) {
                        return roleStr;
                    }
                    // 否則，添加 ROLE_ 前綴
                    else {
                        return "ROLE_" + roleStr.toUpperCase();
                    }
                })
                .collect(Collectors.toList());
            
            logger.debug("Formatted roles for Spring Security: {}", formattedRoles);
            return formattedRoles;
        } catch (Exception e) {
            logger.error("Error extracting roles from JWT token: {}", e.getMessage());
            e.printStackTrace(); // 打印完整堆疊跟蹤
            return List.of(); // 返回空列表而不是 null
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            // 完整記錄令牌前20個字符
            logger.debug("Validating JWT token: {}... (truncated)", 
                     authToken.substring(0, Math.min(20, authToken.length())) + "...");
            
            // 嘗試解析令牌並獲取claims
            Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(authToken).getBody();
            
            // 記錄令牌內容
            logger.debug("Token claims - sub: {}, roles: {}, exp: {}", 
                claims.getSubject(), claims.get("roles"), claims.getExpiration());
            
            // 如果我們到達這裡，則令牌有效
            logger.debug("JWT token validation successful");
            return true;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
            logger.debug("JWT signature validation failed", e);
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            logger.debug("JWT token is malformed", e);
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
            logger.debug("JWT token has expired", e);
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
            logger.debug("JWT token algorithm is unsupported", e);
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
            logger.debug("JWT claims string is empty or invalid", e);
        } catch (Exception e) {
            logger.error("Unexpected error during JWT validation: {}", e.getMessage());
            logger.debug("Unexpected JWT validation error", e);
        }

        return false;
    }
}