package com.digitalconcerthall.config;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.ConsoleAppender;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy;
import ch.qos.logback.core.util.FileSize;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import com.digitalconcerthall.logging.EnhancedLoggingFilter;

import jakarta.annotation.PostConstruct;

/**
 * 日誌配置類
 * 根據環境配置不同的日誌實現
 */
@Configuration
public class LoggingConfig {

    @Value("${logging.file.path:logs}")
    private String logFilePath;
    
    @Value("${logging.file.name:application}")
    private String logFileName;
    
    @Value("${logging.pattern.console:%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n}")
    private String consolePattern;
    
    @Value("${logging.pattern.file:%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n}")
    private String filePattern;
    
    /**
     * 配置測試環境特定日誌
     */
    @PostConstruct
    @Profile("test")
    public void configureTestLogging() {
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        
        // 配置測試專用日誌文件 
        RollingFileAppender<ILoggingEvent> testFileAppender = new RollingFileAppender<>();
        testFileAppender.setContext(loggerContext);
        testFileAppender.setName("testFileAppender");
        testFileAppender.setFile(logFilePath + "/test.log");
        
        PatternLayoutEncoder testEncoder = new PatternLayoutEncoder();
        testEncoder.setContext(loggerContext);
        testEncoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{testId:-NONE}] [%X{testName:-NONE}] [%thread] %-5level %logger{36} - %msg%n");
        testEncoder.start();
        testFileAppender.setEncoder(testEncoder);
        
        SizeAndTimeBasedRollingPolicy<ILoggingEvent> testRollingPolicy = new SizeAndTimeBasedRollingPolicy<>();
        testRollingPolicy.setContext(loggerContext);
        testRollingPolicy.setParent(testFileAppender);
        testRollingPolicy.setFileNamePattern(logFilePath + "/test.%d{yyyy-MM-dd}.%i.log");
        testRollingPolicy.setMaxFileSize(FileSize.valueOf("10MB"));
        testRollingPolicy.setMaxHistory(30);
        testRollingPolicy.start();
        testFileAppender.setRollingPolicy(testRollingPolicy);
        
        testFileAppender.start();
        
        // 添加測試專用日誌到logback配置
        ch.qos.logback.classic.Logger testLogger = loggerContext.getLogger("com.digitalconcerthall.test");
        testLogger.addAppender(testFileAppender);
        testLogger.setAdditive(false);
    }
    
    /**
     * 配置詳細的HTTP請求日誌
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludePayload(true);
        filter.setMaxPayloadLength(10000);
        filter.setIncludeHeaders(true);
        filter.setAfterMessagePrefix("REQUEST DATA: ");
        return filter;
    }
    
    /**
     * 配置自定義的增強日誌過濾器
     */
    @Bean
    public EnhancedLoggingFilter enhancedLoggingFilter() {
        return new EnhancedLoggingFilter();
    }
    
    /**
     * 創建專用的API調用日誌
     */
    @PostConstruct
    public void configureApiLogging() {
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        
        // 配置API日誌文件
        RollingFileAppender<ILoggingEvent> apiFileAppender = new RollingFileAppender<>();
        apiFileAppender.setContext(loggerContext);
        apiFileAppender.setName("apiFileAppender");
        apiFileAppender.setFile(logFilePath + "/api.log");
        
        PatternLayoutEncoder apiEncoder = new PatternLayoutEncoder();
        apiEncoder.setContext(loggerContext);
        apiEncoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{requestId:-NONE}] [%thread] %-5level %logger{36} - %msg%n");
        apiEncoder.start();
        apiFileAppender.setEncoder(apiEncoder);
        
        SizeAndTimeBasedRollingPolicy<ILoggingEvent> apiRollingPolicy = new SizeAndTimeBasedRollingPolicy<>();
        apiRollingPolicy.setContext(loggerContext);
        apiRollingPolicy.setParent(apiFileAppender);
        apiRollingPolicy.setFileNamePattern(logFilePath + "/api.%d{yyyy-MM-dd}.%i.log");
        apiRollingPolicy.setMaxFileSize(FileSize.valueOf("10MB"));
        apiRollingPolicy.setMaxHistory(30);
        apiRollingPolicy.start();
        apiFileAppender.setRollingPolicy(apiRollingPolicy);
        
        apiFileAppender.start();
        
        // 為API相關的日誌添加專門的appender
        ch.qos.logback.classic.Logger apiLogger = loggerContext.getLogger("com.digitalconcerthall.logging.EnhancedLoggingFilter");
        apiLogger.addAppender(apiFileAppender);
        apiLogger.setAdditive(true); // 仍然繼續輸出到根logger
    }
    
    /**
     * 配置專用的性能日誌
     */
    @PostConstruct
    public void configurePerformanceLogging() {
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        
        // 配置性能日誌文件
        RollingFileAppender<ILoggingEvent> perfFileAppender = new RollingFileAppender<>();
        perfFileAppender.setContext(loggerContext);
        perfFileAppender.setName("perfFileAppender");
        perfFileAppender.setFile(logFilePath + "/performance.log");
        
        PatternLayoutEncoder perfEncoder = new PatternLayoutEncoder();
        perfEncoder.setContext(loggerContext);
        perfEncoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n");
        perfEncoder.start();
        perfFileAppender.setEncoder(perfEncoder);
        
        SizeAndTimeBasedRollingPolicy<ILoggingEvent> perfRollingPolicy = new SizeAndTimeBasedRollingPolicy<>();
        perfRollingPolicy.setContext(loggerContext);
        perfRollingPolicy.setParent(perfFileAppender);
        perfRollingPolicy.setFileNamePattern(logFilePath + "/performance.%d{yyyy-MM-dd}.%i.log");
        perfRollingPolicy.setMaxFileSize(FileSize.valueOf("10MB"));
        perfRollingPolicy.setMaxHistory(30);
        perfRollingPolicy.start();
        perfFileAppender.setRollingPolicy(perfRollingPolicy);
        
        perfFileAppender.start();
        
        // 專門記錄性能相關日誌
        ch.qos.logback.classic.Logger perfLogger = loggerContext.getLogger("com.digitalconcerthall.logging.MethodLoggingAspect");
        perfLogger.addAppender(perfFileAppender);
        perfLogger.setAdditive(true);
    }
}
