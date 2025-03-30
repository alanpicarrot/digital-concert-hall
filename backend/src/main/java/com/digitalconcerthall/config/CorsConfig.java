package com.digitalconcerthall.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 允許特定來源
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:3001");
        // 允許所有頭信息
        config.addAllowedHeader("*");
        // 允許所有方法
        config.addAllowedMethod("*");
        // 允許憑證
        config.setAllowCredentials(true);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
