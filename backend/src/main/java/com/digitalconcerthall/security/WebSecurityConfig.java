package com.digitalconcerthall.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.digitalconcerthall.security.jwt.AuthEntryPointJwt;
import com.digitalconcerthall.security.jwt.AuthTokenFilter;
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // 已啟用方法級安全控制
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);  // 使用自定義UserDetailsServiceImpl
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允許來自用戶前台和管理後台的請求
        // 在corsConfigurationSource方法中更新允許的源
        configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000", // 用戶前台
            "http://localhost:3001"  // 管理後台
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth
                    .requestMatchers("/api/auth/**").permitAll() // 授權相關端點
                    .requestMatchers("/auth/**").permitAll() // 保留舊路徑以兼容
                    .requestMatchers("/h2-console/**").permitAll() // 允許訪問H2數據庫控制台（僅開發環境）
                    .requestMatchers("/public/**").permitAll() // 允許訪問公共資源
                    .requestMatchers("/api/concerts/**").permitAll() // 允許未認證用戶訪問音樂會信息
                    .requestMatchers("/api/performances/**").permitAll() // 允許未認證用戶訪問演出場次信息
                    .requestMatchers("/api/tickets/available").permitAll() // 允許查看可用票券
                    .requestMatchers("/api/debug/**").permitAll() // 開發環境調試端點
                    .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") // 管理員API需要ADMIN角色
                    .requestMatchers("/api/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                    .anyRequest().authenticated()
            );
        
        // 允許H2控制台的框架顯示（僅開發環境）
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        http.authenticationProvider(authenticationProvider());

        // 在filterChain方法中增加以下過濾器配置
        http.addFilterBefore(
            authenticationJwtTokenFilter(), 
            UsernamePasswordAuthenticationFilter.class
        );
        
        return http.build();
    }
}
