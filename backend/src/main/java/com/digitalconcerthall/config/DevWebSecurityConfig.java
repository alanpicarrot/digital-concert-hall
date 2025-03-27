package com.digitalconcerthall.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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

/**
 * 開發環境的安全配置
 * 允許訪問 /debug/** 路徑以便測試
 */
@Configuration
@EnableMethodSecurity
@Profile("dev")
@Order(1)
public class DevWebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    public CorsConfigurationSource devCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean("devFilterChain")
    public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(devCorsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            
        http.authorizeHttpRequests(auth -> 
                auth.requestMatchers("/auth/**", "/debug/**", "/setup/**", "/placeholder/**", "/api/placeholder/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    .anyRequest().authenticated()
            );
        
        // For H2 Console
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        
        http.authenticationProvider(authProvider);
        http.addFilterBefore(authTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean("devAuthTokenFilter")
    public AuthTokenFilter authTokenFilter() {
        return new AuthTokenFilter();
    }
}