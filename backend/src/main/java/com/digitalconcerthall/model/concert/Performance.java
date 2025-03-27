package com.digitalconcerthall.model.concert;

import com.digitalconcerthall.model.ticket.Ticket;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "performances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Performance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "concert_id", nullable = false)
    private Concert concert;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(nullable = false, length = 100)
    private String venue;
    
    @Column(nullable = false, length = 20)
    private String status; // scheduled, live, completed, cancelled
    
    @Column(name = "livestream_url")
    private String livestreamUrl;
    
    @Column(name = "recording_url")
    private String recordingUrl;
    
    @OneToMany(mappedBy = "performance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ticket> tickets = new ArrayList<>();
}
