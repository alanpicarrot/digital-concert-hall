package com.digitalconcerthall.config;

import com.digitalconcerthall.security.jwt.AuthEntryPointJwt;
import com.digitalconcerthall.security.jwt.AuthTokenFilter;
import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.AdminUserDetailsServiceImpl; // <-- 導入 AdminUserDetailsServiceImpl
import com.digitalconcerthall.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager; // <-- 導入 ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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

    @Autowired // <-- 注入 AuthTokenFilter (因為它現在是 @Component)
    private AuthTokenFilter authTokenFilter;

    // 不再需要 @Bean public AuthTokenFilter authTokenFilter() { ... } 這個方法
    // Spring 會自動掃描並創建 @Component

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
                    "/api/register", // <-- 將註冊路徑添加到這裡
                    "/api/auth/admin/signin",
                    "/api/auth/admin/signup",
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


        // 直接使用注入的 authTokenFilter 實例
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
    
        return http.build();
    }
}
