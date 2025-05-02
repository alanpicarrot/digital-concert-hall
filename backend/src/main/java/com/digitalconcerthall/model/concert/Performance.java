package com.digitalconcerthall.model.concert;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;
import java.util.Objects;

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
    @JsonBackReference
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
    @JsonIgnore
    private List<Ticket> tickets = new ArrayList<>();

    // 提供 concertId 方便前端使用
    public Long getConcertId() {
        return concert != null ? concert.getId() : null;
    }

    public Long getId() {
        return this.id; // 確保 `id` 屬性存在
    }
    
    // 提供演出名稱
    public String getName() {
        return concert != null ? concert.getTitle() : "未命名演出";
    }

    /**
     * 從關聯的 Ticket 列表中獲取所有不同的 TicketType。
     * 這個方法是為了配合 ConcertService 中的邏輯。
     * @return 與此 Performance 相關的所有 TicketType 的 Set 集合。
     */
    // 注意：這個方法不會被 JPA 持久化，它只是一個便捷的 getter
    public Set<TicketType> getTicketTypes() {
        if (this.tickets == null) {
            return new HashSet<>(); // 返回空集合，避免 NullPointerException
        }
        return this.tickets.stream()
                .map(Ticket::getTicketType) // 從每個 Ticket 獲取 TicketType
                .filter(Objects::nonNull) // 過濾掉空的 TicketType
                .collect(Collectors.toSet()); // 收集到 Set 中以確保唯一性
    }
}
