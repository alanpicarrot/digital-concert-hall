package com.digitalconcerthall.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 表演場次詳情響應DTO
 */
public class PerformanceDetailResponse {
    
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    private String venue;
    
    private String status;
    
    private Integer duration; // 演出時長（分鐘）
    
    private Long concertId;
    
    private String concertTitle;
    
    private String concertDescription;
    
    private String posterUrl;
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public String getVenue() {
        return venue;
    }
    
    public void setVenue(String venue) {
        this.venue = venue;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public Long getConcertId() {
        return concertId;
    }
    
    public void setConcertId(Long concertId) {
        this.concertId = concertId;
    }
    
    public String getConcertTitle() {
        return concertTitle;
    }
    
    public void setConcertTitle(String concertTitle) {
        this.concertTitle = concertTitle;
    }
    
    public String getConcertDescription() {
        return concertDescription;
    }
    
    public void setConcertDescription(String concertDescription) {
        this.concertDescription = concertDescription;
    }
    
    public String getPosterUrl() {
        return posterUrl;
    }
    
    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }
}
