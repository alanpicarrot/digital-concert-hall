package com.digitalconcerthall.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    @Bean
    public ObjectMapper objectMapper() {
        JavaTimeModule module = new JavaTimeModule();
        LocalDateTimeSerializer localDateTimeSerializer = 
            new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT));
        module.addSerializer(LocalDateTime.class, localDateTimeSerializer);
        
        return Jackson2ObjectMapperBuilder.json()
                .modules(module)
                .build();
    }
}
