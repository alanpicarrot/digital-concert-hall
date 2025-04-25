package com.digitalconcerthall.config;

import com.digitalconcerthall.security.jwt.AuthEntryPointJwt;
import com.digitalconcerthall.security.jwt.AuthTokenFilter;
import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.AdminUserDetailsServiceImpl; // <-- 導入 AdminUserDetailsServiceImpl
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier; // <-- 導入 Qualifier
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary; // <-- 導入 Primary
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager; // <-- 導入 ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List; // <-- 導入 List

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService; // 用於普通用戶

    @Autowired
    AdminUserDetailsServiceImpl adminUserDetailsService; // <-- 注入 AdminUserDetailsServiceImpl

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private JwtUtils jwtUtils;

    @Bean
    public AuthTokenFilter authTokenFilter() {
        // 注意：AuthTokenFilter 可能也需要區分普通用戶和管理員，
        // 取決於您的 JWT 驗證邏輯是否需要從不同的 UserDetailsService 加載用戶。
        // 如果 JWT payload 中包含用戶類型或角色信息，可以在 filter 中判斷調用哪個 service。
        // 暫時保持不變，假設它能處理兩種用戶。
        return new AuthTokenFilter(jwtUtils, userDetailsService); // 或者需要更複雜的邏輯
    }

    // ... CorsConfigurationSource Bean 不變 ...
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 為普通用戶創建 AuthenticationProvider
    @Bean
    public DaoAuthenticationProvider userAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 為管理員創建 AuthenticationProvider
    @Bean
    public DaoAuthenticationProvider adminAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // 確保這裡使用的是 AdminUserDetailsServiceImpl
        authProvider.setUserDetailsService(adminUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 配置 AuthenticationManager 以包含兩個 Provider
    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        // ProviderManager 會按順序嘗試列表中的 Provider
        return new ProviderManager(List.of(adminAuthenticationProvider(), userAuthenticationProvider()));
        // 或者，如果 AuthenticationConfiguration 能自動處理多個 Provider Bean，
        // 則原來的 @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception 可能仍然有效。
        // 但顯式創建 ProviderManager 更清晰。
        // return authConfig.getAuthenticationManager(); // 可以嘗試保留這個，如果不行再換成上面的 ProviderManager
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/admin/signin", // <-- 確保管理員登入路徑也包含在內
                    "/api/auth/admin/signup", // <-- 確保管理員註冊路徑也包含在內
                    "/api/auth/**",
                    "/h2-console/**",
                    "/public/**",
                    "/api/debug/**",
                    "/api/concerts/**",
                    "/api/performances/**",
                    "/api/tickets/available",
                    "/api/direct/**",
                    "/api/setup/**"
                ).permitAll()
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .anyRequest().authenticated()
            );

        // 確保 H2 console 的 frame options 允許 (如果使用 H2)
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));


        http.addFilterBefore(authTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
