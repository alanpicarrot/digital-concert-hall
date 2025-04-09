package com.digitalconcerthall.model.concert;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "concerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Concert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "program_details", columnDefinition = "TEXT")
    private String programDetails;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(name = "brochure_url")
    private String brochureUrl;
    
    @Column(nullable = false, length = 20)
    private String status; // active, inactive, upcoming, past
    
    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;
    
    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "concert", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Performance> performances = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
