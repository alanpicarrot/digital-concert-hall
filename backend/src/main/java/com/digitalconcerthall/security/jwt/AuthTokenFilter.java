package com.digitalconcerthall.security.jwt;

import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // 增強日誌記錄，檢查請求頭
            logger.debug("Processing request: {} {}", request.getMethod(), request.getRequestURI());
            String authHeader = request.getHeader("Authorization");
            logger.debug("Authorization header: {}", 
                     authHeader != null ? 
                     authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null");
            
            String jwt = parseJwt(request);
            logger.debug("Parsed JWT from request: {}... (truncated)", jwt != null ? jwt.substring(0, Math.min(10, jwt.length())) + "..." : "null");
            
            if (jwt != null) {
                logger.debug("Request URI: {}", request.getRequestURI());
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    logger.debug("JWT token is valid");
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    Long userId = jwtUtils.getUserIdFromJwtToken(jwt);
                    logger.debug("Username from token: {}", username);
                    logger.debug("UserId from token: {}", userId);
                
                    // 新增：userId 為 null 時直接拒絕
                    if (userId == null) {
                        logger.error("JWT token does not contain a valid userId, authentication aborted.");
                        filterChain.doFilter(request, response);
                        return;
                    }
                
                    // 用 userId 查詢用戶
UserDetails userDetails = userDetailsService.loadUserById(userId);
logger.debug("User details loaded, user ID: {}, authorities: {}", 
          ((UserDetailsImpl)userDetails).getId(), 
          userDetails.getAuthorities());
                    
                    // 直接從 JWT 中提取角色
                    List<String> roles = jwtUtils.getRolesFromJwtToken(jwt);
                    logger.debug("Roles from JWT: {}", roles);
                
                    // 將角色轉換為GrantedAuthority
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> {
                            // 轉換為字符串來確保安全
                            String roleStr = role.toString();
                            
                            // 確保角色名稱符合 Spring Security 的要求
                            if (!roleStr.startsWith("ROLE_")) {
                                roleStr = "ROLE_" + roleStr.toUpperCase();
                                logger.debug("Role name adjusted to: {}", roleStr);
                            }
                            return new SimpleGrantedAuthority(roleStr);
                        })
                        .collect(Collectors.toList());
                    
                    logger.debug("Final authorities for authentication: {}", authorities);
                    
                    // 建立身份驗證令牌
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                        );
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
            // 打印完整堆疊以便調試
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        // 嘗試從標準 Authorization 頭獲取
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        // 兼容小寫 authorization 頭
        headerAuth = request.getHeader("authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        // 嘗試從請求參數中獲取
        String paramToken = request.getParameter("token");
        if (StringUtils.hasText(paramToken)) {
            return paramToken;
        }
        
        return null;
    }
}
