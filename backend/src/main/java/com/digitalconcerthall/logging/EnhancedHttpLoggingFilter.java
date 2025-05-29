package com.digitalconcerthall.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 增強版HTTP請求日誌過濾器
 * 為每個請求添加追蹤ID，記錄詳細的請求和響應資訊
 */
@Component
public class EnhancedHttpLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedHttpLoggingFilter.class);
    private static final Logger apiLogger = LoggerFactory.getLogger("API_REQUESTS");
    
    private static final String TRACE_ID_HEADER = "X-Trace-ID";
    private static final String REQUEST_START_TIME = "REQUEST_START_TIME";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // 生成或獲取追蹤ID
        String traceId = getOrGenerateTraceId(request);
        
        // 設置MDC
        MDC.put("traceId", traceId);
        MDC.put("requestMethod", request.getMethod());
        MDC.put("requestURI", request.getRequestURI());
        
        // 記錄請求開始時間
        long startTime = System.currentTimeMillis();
        request.setAttribute(REQUEST_START_TIME, startTime);
        
        // 記錄請求資訊
        logRequestInfo(request, traceId);
        
        try {
            // 繼續處理請求
            filterChain.doFilter(request, response);
        } finally {
            // 記錄響應資訊
            logResponseInfo(request, response, traceId, startTime);
            
            // 清理MDC
            MDC.clear();
        }
    }

    /**
     * 獲取或生成追蹤ID
     */
    private String getOrGenerateTraceId(HttpServletRequest request) {
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.trim().isEmpty()) {
            traceId = generateTraceId();
        }
        return traceId;
    }

    /**
     * 生成追蹤ID
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    /**
     * 記錄請求資訊
     */
    private void logRequestInfo(HttpServletRequest request, String traceId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
        
        StringBuilder logMessage = new StringBuilder();
        logMessage.append(">>> HTTP請求開始 <<<\n");
        logMessage.append("追蹤ID: ").append(traceId).append("\n");
        logMessage.append("時間: ").append(timestamp).append("\n");
        logMessage.append("方法: ").append(request.getMethod()).append("\n");
        logMessage.append("URL: ").append(request.getRequestURL()).append("\n");
        logMessage.append("URI: ").append(request.getRequestURI()).append("\n");
        
        if (request.getQueryString() != null) {
            logMessage.append("查詢參數: ").append(request.getQueryString()).append("\n");
        }
        
        logMessage.append("客戶端IP: ").append(getClientIpAddress(request)).append("\n");
        logMessage.append("User-Agent: ").append(request.getHeader("User-Agent")).append("\n");
        
        // 記錄重要的請求頭
        String contentType = request.getContentType();
        if (contentType != null) {
            logMessage.append("Content-Type: ").append(contentType).append("\n");
        }
        
        String authorization = request.getHeader("Authorization");
        if (authorization != null) {
            // 只記錄前幾個字符，保護敏感資訊
            String maskedAuth = authorization.length() > 20 ? 
                authorization.substring(0, 20) + "..." : authorization;
            logMessage.append("Authorization: ").append(maskedAuth).append("\n");
        }
        
        // 記錄會話資訊
        if (request.getSession(false) != null) {
            logMessage.append("會話ID: ").append(request.getSession().getId()).append("\n");
        }
        
        apiLogger.info(logMessage.toString());
    }

    /**
     * 記錄響應資訊
     */
    private void logResponseInfo(HttpServletRequest request, HttpServletResponse response, 
                               String traceId, long startTime) {
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
        
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("<<< HTTP響應結束 <<<\n");
        logMessage.append("追蹤ID: ").append(traceId).append("\n");
        logMessage.append("時間: ").append(timestamp).append("\n");
        logMessage.append("狀態碼: ").append(response.getStatus()).append("\n");
        logMessage.append("處理時間: ").append(duration).append(" ms\n");
        
        // 記錄響應頭
        String contentType = response.getContentType();
        if (contentType != null) {
            logMessage.append("響應Content-Type: ").append(contentType).append("\n");
        }
        
        // 根據處理時間和狀態碼決定日誌級別
        if (response.getStatus() >= 500) {
            logger.error(logMessage.toString());
        } else if (response.getStatus() >= 400) {
            logger.warn(logMessage.toString());
        } else if (duration > 1000) {
            logger.warn(logMessage.toString()); // 處理時間超過1秒的請求
        } else {
            apiLogger.info(logMessage.toString());
        }
    }

    /**
     * 獲取客戶端真實IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // 如果有多個IP，取第一個
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }
        
        return request.getRemoteAddr();
    }

    /**
     * 判斷是否需要跳過日誌記錄
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // 跳過健康檢查和靜態資源
        return path.startsWith("/actuator/health") ||
               path.startsWith("/favicon.ico") ||
               path.startsWith("/static/") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/") ||
               path.startsWith("/images/");
    }
}
