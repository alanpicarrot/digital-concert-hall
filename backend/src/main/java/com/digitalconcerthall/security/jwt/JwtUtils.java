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
        
        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                // 添加角色信息到 claims 中
                .claim("roles", roles)
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
                    // 如果角色已經是 ROLE_ 開頭的，則保留原樣
                    if (role.startsWith("ROLE_")) {
                        return role;
                    }
                    // 否則，檢查是否需要添加 ROLE_ 前綴
                    else {
                        return role.toUpperCase().startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
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
            logger.debug("Validating JWT token: {}... (truncated)", 
                     authToken.substring(0, Math.min(10, authToken.length())) + "...");
            
            // Try to parse the token
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            
            // If we get here, the token is valid
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
