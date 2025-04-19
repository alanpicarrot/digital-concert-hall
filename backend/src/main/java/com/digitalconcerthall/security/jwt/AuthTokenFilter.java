package com.digitalconcerthall.security.jwt;

import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

@Component
public class AuthTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;  // Inject JwtUtils instance

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            logger.debug("Parsed JWT from request: {}... (truncated)", jwt != null ? jwt.substring(0, Math.min(10, jwt.length())) + "..." : "null");
            
            if (jwt != null) {
                logger.debug("Request URI: {}", request.getRequestURI());
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    logger.debug("JWT token is valid");
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);  // Use instance method
                    logger.debug("Username from token: {}", username);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    logger.debug("User details loaded, user ID: {}, authorities: {}", 
                              ((UserDetailsImpl)userDetails).getId(), 
                              userDetails.getAuthorities());
                    
                    // 直接從 JWT 中提取角色
                    List<String> roles = jwtUtils.getRolesFromJwtToken(jwt);
                    logger.debug("Roles from JWT: {}", roles);
                
                    // 將角色轉換為GrantedAuthority
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> {
                            // 確保角色名稱符合 Spring Security 的要求
                            if (!role.startsWith("ROLE_")) {
                                role = "ROLE_" + role.toUpperCase();
                                logger.debug("Role name adjusted to: {}", role);
                            }
                            return new SimpleGrantedAuthority(role);
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
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
