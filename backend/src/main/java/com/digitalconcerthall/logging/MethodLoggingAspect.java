package com.digitalconcerthall.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.lang.reflect.Method;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * 方法執行日誌切面
 * 用於記錄方法的調用參數、返回值、執行時間以及異常信息
 */
@Aspect
@Component
public class MethodLoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(MethodLoggingAspect.class);
    private final ObjectMapper objectMapper;
    
    public MethodLoggingAspect() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        // 設置最大長度，避免日誌太大
        this.objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
    }
    
    // 定義切點: 所有服務方法和控制器方法
    @Pointcut("execution(* com.digitalconcerthall.service..*.*(..))")
    public void serviceMethod() {}
    
    @Pointcut("execution(* com.digitalconcerthall.controller..*.*(..))")
    public void controllerMethod() {}
    
    @Pointcut("execution(* com.digitalconcerthall.repository..*.*(..))")
    public void repositoryMethod() {}
    
    // 使用自定義註解的方法
    @Pointcut("@annotation(com.digitalconcerthall.logging.LogExecutionTime)")
    public void annotatedMethod() {}
    
    // 環繞通知: 記錄方法執行的詳細信息
    @Around("(serviceMethod() || controllerMethod() || repositoryMethod() || annotatedMethod()) && !execution(* com.digitalconcerthall.logging..*.*(..))")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        // 檢查是否要跳過不重要的方法
        if (shouldSkipLogging(joinPoint)) {
            return joinPoint.proceed();
        }
        
        // 獲取方法簽名和參數
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        Object[] args = joinPoint.getArgs();
        
        // 獲取參數名稱
        String[] parameterNames = signature.getParameterNames();
        
        // 構建參數日誌
        String parametersLog = buildParametersLog(parameterNames, args);
        
        // 獲取請求ID (如果存在)
        String requestId = MDC.get("requestId");
        if (requestId == null) {
            // 如果不存在請求ID，使用方法調用信息作為標識
            requestId = className + "." + methodName;
            MDC.put("methodId", requestId);
        }
        
        // 記錄方法開始執行
        logger.debug("\n▶ Method Execution [{}] - {}.{}({})", 
                requestId, className, methodName, parametersLog);
        
        Instant startTime = Instant.now();
        Object result = null;
        boolean hasError = false;
        
        try {
            // 執行原方法
            result = joinPoint.proceed();
            return result;
        } catch (Throwable t) {
            hasError = true;
            logger.error("\n❌ Method Exception [{}] - {}.{}: {}", 
                    requestId, className, methodName, t.getMessage(), t);
            throw t;
        } finally {
            Instant endTime = Instant.now();
            long durationMs = Duration.between(startTime, endTime).toMillis();
            
            // 根據方法類型和執行時間確定日誌級別
            boolean isSlowExecution = durationMs > 1000; // 超過1秒視為慢執行
            
            if (hasError) {
                // 已經在catch塊中記錄了錯誤
            } else if (isSlowExecution) {
                logger.warn("\n⚠ Slow Method Execution [{}] - {}.{} completed in {} ms", 
                        requestId, className, methodName, durationMs);
                
                if (result != null) {
                    try {
                        String resultStr = objectMapper.writeValueAsString(result);
                        // 限制結果日誌長度
                        if (resultStr.length() > 1000) {
                            resultStr = resultStr.substring(0, 1000) + "... [truncated]";
                        }
                        logger.debug("\n↩ Return Value [{}]: {}", requestId, resultStr);
                    } catch (Exception e) {
                        logger.debug("\n↩ Return Value [{}]: [Complex Object: {}]", requestId, result.getClass().getName());
                    }
                } else {
                    logger.debug("\n↩ Return Value [{}]: null", requestId);
                }
            } else {
                logger.debug("\n✓ Method Execution [{}] - {}.{} completed in {} ms", 
                        requestId, className, methodName, durationMs);
                
                // 對於Debug級別，還記錄返回值
                if (logger.isDebugEnabled() && result != null) {
                    try {
                        String resultStr = objectMapper.writeValueAsString(result);
                        // 限制結果日誌長度
                        if (resultStr.length() > 1000) {
                            resultStr = resultStr.substring(0, 1000) + "... [truncated]";
                        }
                        logger.debug("\n↩ Return Value [{}]: {}", requestId, resultStr);
                    } catch (Exception e) {
                        logger.debug("\n↩ Return Value [{}]: [Complex Object: {}]", requestId, result.getClass().getName());
                    }
                }
            }
            
            // 如果我們添加了methodId，現在要移除它
            if (MDC.get("methodId") != null) {
                MDC.remove("methodId");
            }
        }
    }
    
    private String buildParametersLog(String[] parameterNames, Object[] args) {
        if (args.length == 0) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            
            String paramName = (parameterNames != null && i < parameterNames.length) 
                    ? parameterNames[i] : "arg" + i;
            
            if (args[i] == null) {
                sb.append(paramName).append("=null");
            } else {
                // 處理密碼參數
                if (paramName.toLowerCase().contains("password") || 
                    paramName.toLowerCase().contains("secret") || 
                    paramName.toLowerCase().contains("key")) {
                    sb.append(paramName).append("=[REDACTED]");
                } else {
                    try {
                        // 嘗試轉為JSON
                        String argStr = objectMapper.writeValueAsString(args[i]);
                        // 截斷過長的字符串
                        if (argStr.length() > 500) {
                            argStr = argStr.substring(0, 500) + "... [truncated]";
                        }
                        sb.append(paramName).append("=").append(argStr);
                    } catch (Exception e) {
                        // 如果無法序列化，則使用toString
                        sb.append(paramName).append("=").append(args[i].toString());
                    }
                }
            }
        }
        return sb.toString();
    }
    
    private boolean shouldSkipLogging(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 跳過常見的getter、setter和toString等方法
        String methodName = method.getName();
        if ((methodName.startsWith("get") || methodName.startsWith("set") || 
             methodName.startsWith("is") || methodName.equals("toString") || 
             methodName.equals("hashCode") || methodName.equals("equals")) && 
            method.getParameterCount() <= 1) {
            return true;
        }
        
        // 檢查是否有自定義註解要求跳過日誌
        if (method.isAnnotationPresent(SkipLogging.class)) {
            return true;
        }
        
        return false;
    }
}
