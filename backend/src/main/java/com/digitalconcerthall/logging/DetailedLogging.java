package com.digitalconcerthall.logging;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 標記需要記錄較多詳情的方法
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DetailedLogging {
    /**
     * 詳細日誌的重要性級別
     */
    LogLevel level() default LogLevel.DEBUG;
    
    /**
     * 是否記錄完整請求/響應詳情
     */
    boolean includeFullDetails() default true;
    
    /**
     * 是否包含調用堆疊
     */
    boolean includeCallStack() default false;
}
