package com.digitalconcerthall.security.jwt;

import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; // <-- 允許 Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // <-- 標記為 Component
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;


import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component // <-- 確保是 Component
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired // <-- 使用 Autowired 注入
    private JwtUtils jwtUtils;

    @Autowired // <-- 注入 User Service
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    // 移除構造函數注入，因為我們改用 @Autowired

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
            
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                logger.debug("Request URI: {}", request.getRequestURI());
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    logger.debug("JWT token is valid");
                    String username = jwtUtils.getUserNameFromJwtToken(jwt); // 可能需要，也可能不需要
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
                            String roleStr = role.toString();
                            if (!roleStr.startsWith("ROLE_")) {
                                roleStr = "ROLE_" + roleStr.toUpperCase();
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
