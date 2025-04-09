package com.digitalconcerthall.logging;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 用於測試的方法標記
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TestMethod {
    /**
     * 測試方法描述
     */
    String description() default "";
    
    /**
     * 測試相關ID或標籤
     */
    String[] tags() default {};
    
    /**
     * 期望的結果條件
     */
    String expected() default "";
}
