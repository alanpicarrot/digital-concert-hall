package com.digitalconcerthall.logging;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 標記方法，以測量並記錄執行時間
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
    /**
     * 是否包含參數值
     */
    boolean includeArgs() default true;
    
    /**
     * 是否包含返回值
     */
    boolean includeResult() default true;
    
    /**
     * 慢調用閾值（毫秒）
     */
    long slowThreshold() default 1000;
}
