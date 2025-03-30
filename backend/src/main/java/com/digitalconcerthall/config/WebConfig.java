package com.digitalconcerthall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 明確定義靜態資源位置，避免API請求被當作靜態資源處理
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
                
        // 確保 /webjars/ 路徑能正確訪問WebJars內容
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
}
