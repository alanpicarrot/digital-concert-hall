package com.digitalconcerthall.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 增強的 HTTP 請求日誌過濾器
 * 收集請求/響應詳情、執行時間及其他上下文信息
 */
@Component
public class EnhancedLoggingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(EnhancedLoggingFilter.class);
    private final ObjectMapper objectMapper;

    public EnhancedLoggingFilter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        // 為每個請求生成唯一ID並存入MDC
        String requestId = UUID.randomUUID().toString().replace("-", "");
        MDC.put("requestId", requestId);
        
        // 包裝請求和響應以便多次讀取
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
        
        // 記錄請求開始時間
        Instant startTime = Instant.now();
        
        // 添加請求開始的詳細日誌
        logRequest(requestWrapper);
        
        boolean hasError = false;
        try {
            // 繼續過濾器鏈
            filterChain.doFilter(requestWrapper, responseWrapper);
        } catch (Exception e) {
            hasError = true;
            logger.error("Request processing error [{}]: {}", requestId, e.getMessage(), e);
            throw e;
        } finally {
            // 記錄響應詳情
            Instant endTime = Instant.now();
            long durationMs = Duration.between(startTime, endTime).toMillis();
            logResponse(responseWrapper, durationMs, hasError);
            responseWrapper.copyBodyToResponse(); // 不要忘記這一步
            MDC.remove("requestId");
        }
    }
    
    private void logRequest(ContentCachingRequestWrapper request) throws IOException {
        // 獲取並記錄請求頭
        StringBuilder headersBuilder = new StringBuilder();
        java.util.Iterator<String> headerNames = request.getHeaderNames().asIterator();
        boolean first = true;
        while (headerNames.hasNext()) {
            String headerName = headerNames.next();
            if (!first) {
                headersBuilder.append(", ");
            }
            headersBuilder.append(headerName).append(": ").append(request.getHeader(headerName));
            first = false;
        }
        String headers = headersBuilder.toString();
        
        // 讀取請求體 (如果適用)
        String requestBody = "";
        if (request.getContentLength() > 0) {
            byte[] content = request.getContentAsByteArray();
            if (content.length > 0) {
                try {
                    requestBody = new String(content, request.getCharacterEncoding());
                    // 如果是JSON，美化輸出
                    if (request.getContentType() != null && request.getContentType().contains("application/json")) {
                        try {
                            Object json = objectMapper.readValue(requestBody, Object.class);
                            requestBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
                        } catch (Exception e) {
                            // 不是有效的JSON，使用原始字符串
                        }
                    }
                } catch (Exception e) {
                    requestBody = "[二進制內容]";
                }
            }
        }
        
        // 構建並記錄完整請求信息
        String logMessage = String.format(
                "\n━━━━━ REQUEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "ID: %s\n" +
                "URI: %s\n" +
                "METHOD: %s\n" +
                "QUERY: %s\n" +
                "CLIENT IP: %s\n" +
                "HEADERS: [%s]\n" +
                "BODY: %s\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                MDC.get("requestId"),
                request.getRequestURI(),
                request.getMethod(),
                request.getQueryString() != null ? request.getQueryString() : "",
                request.getRemoteAddr(),
                headers,
                requestBody);
        
        logger.info(logMessage);
    }
    
    private void logResponse(ContentCachingResponseWrapper response, long durationMs, boolean hasError) throws IOException {
        // 獲取響應頭
        StringBuilder headersBuilder = new StringBuilder();
        java.util.Collection<String> headerNames = response.getHeaderNames();
        boolean first = true;
        for (String headerName : headerNames) {
            if (!first) {
                headersBuilder.append(", ");
            }
            headersBuilder.append(headerName).append(": ").append(response.getHeader(headerName));
            first = false;
        }
        String headers = headersBuilder.toString();
        
        // 讀取響應體 (如果存在)
        String responseBody = "";
        byte[] content = response.getContentAsByteArray();
        if (content.length > 0) {
            try {
                responseBody = new String(content, response.getCharacterEncoding());
                // 如果是JSON，美化輸出
                if (response.getContentType() != null && response.getContentType().contains("application/json")) {
                    try {
                        Object json = objectMapper.readValue(responseBody, Object.class);
                        responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
                    } catch (Exception e) {
                        // 不是有效的JSON，使用原始字符串
                    }
                }
            } catch (Exception e) {
                responseBody = "[二進制內容]";
            }
        }
        
        // 選擇適當的日誌級別 (基於狀態碼或錯誤狀態)
        String logLevel = "INFO";
        if (hasError || response.getStatus() >= 400) {
            logLevel = "ERROR";
        } else if (response.getStatus() >= 300) {
            logLevel = "WARN";
        }
        
        // 構建並記錄完整響應信息
        String logMessage = String.format(
                "\n━━━━━ RESPONSE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "ID: %s\n" +
                "STATUS: %d\n" +
                "DURATION: %d ms\n" +
                "HEADERS: [%s]\n" +
                "BODY: %s\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                MDC.get("requestId"),
                response.getStatus(),
                durationMs,
                headers,
                responseBody);
        
        // 根據狀態碼使用不同的日誌級別
        if ("ERROR".equals(logLevel)) {
            logger.error(logMessage);
        } else if ("WARN".equals(logLevel)) {
            logger.warn(logMessage);
        } else {
            logger.info(logMessage);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // 排除不需要記錄的路徑，例如靜態資源
        String path = request.getRequestURI();
        return path.contains("/h2-console") || 
               path.contains("/assets") || 
               path.contains("/static") || 
               path.contains("/favicon.ico");
    }
}
