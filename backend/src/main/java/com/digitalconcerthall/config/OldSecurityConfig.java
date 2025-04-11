package com.digitalconcerthall.config;

// 將類更名為 OldSecurityConfig
// 移除 @Configuration 和 @EnableWebSecurity 註解
// 以避免與 WebSecurityConfig 衝突

/*
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationEntryPointFailureHandler;

import com.digitalconcerthall.security.jwt.AuthEntryPointJwt;
import com.digitalconcerthall.security.jwt.AuthTokenFilter;

@Configuration
@EnableWebSecurity
*/
public class OldSecurityConfig {
    
    /*
    private final AuthTokenFilter authTokenFilter;
    private final AuthEntryPointJwt unauthorizedHandler;

    public SecurityConfig(AuthTokenFilter authTokenFilter, 
                         AuthEntryPointJwt unauthorizedHandler) {
        this.authTokenFilter = authTokenFilter;
        this.unauthorizedHandler = unauthorizedHandler;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/concerts/**").permitAll() // 允許未認證用戶訪問音樂會信息
                .requestMatchers("/api/performances/**").permitAll() // 允許未認證用戶訪問演出場次信息
                .requestMatchers("/api/debug/**").permitAll() // 開發環境調試端點
                .requestMatchers("/api/tickets/available").permitAll() // 允許查看可用票券
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(unauthorizedHandler)
            )
            .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    */
}
