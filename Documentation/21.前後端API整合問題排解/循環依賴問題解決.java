/**
 * 循環依賴問題解決方案示例
 * 
 * 這個文件演示了如何使用Jackson註解解決實體類之間的循環引用問題。
 */
package com.digitalconcerthall.model.concert;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Concert 實體類 - 父方（"一"方）
 */
@Entity
@Data
public class Concert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    // 其他屬性...
    
    /**
     * 使用 @JsonManagedReference 標記父方的集合
     * 這表示序列化時，這個屬性會被序列化，但子方的反向引用會被忽略
     */
    @OneToMany(mappedBy = "concert", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Performance> performances = new ArrayList<>();
}

/**
 * Performance 實體類 - 子方（"多"方）
 */
@Entity
@Data
public class Performance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 使用 @JsonBackReference 標記子方對父方的引用
     * 這表示這個屬性在序列化時會被忽略，避免循環
     */
    @ManyToOne
    @JoinColumn(name = "concert_id", nullable = false)
    @JsonBackReference
    private Concert concert;
    
    // 時間和地點屬性
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private String status;
    
    /**
     * 使用 @JsonIgnore 完全忽略某個屬性的序列化
     * 當不需要將此集合暴露給前端時使用
     */
    @OneToMany(mappedBy = "performance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();
    
    /**
     * 提供一個輔助方法，幫助前端獲取 concertId
     * 由於 concert 對象被 @JsonBackReference 標記，不會被序列化，
     * 所以需要這個方法提供 ID 信息
     */
    public Long getConcertId() {
        return concert != null ? concert.getId() : null;
    }
}

/**
 * 使用說明：
 * 
 * 1. @JsonManagedReference 和 @JsonBackReference 總是成對使用
 *    - @JsonManagedReference 用在父方（"一"方）
 *    - @JsonBackReference 用在子方（"多"方）
 * 
 * 2. @JsonIgnore 可以單獨使用，完全排除屬性的序列化
 * 
 * 3. 如果實體間有多重循環依賴，可以使用不同的標識符區分：
 *    @JsonManagedReference("concert-performances")
 *    @JsonBackReference("concert-performances")
 * 
 * 4. 使用這些註解後，需要提供輔助方法（如 getConcertId）以便前端獲取關聯ID
 */
