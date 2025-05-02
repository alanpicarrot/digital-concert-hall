package com.digitalconcerthall.dto.response;
import com.digitalconcerthall.dto.response.ticket.TicketTypeClientResponse; // 新增導入
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConcertPerformanceResponse {
    private Long id;
    private String title;
    private String description;
    private String programDetails;
    private String posterUrl;
    private String brochureUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PerformanceInfo> performances;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PerformanceInfo {
        private Long id;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String venue;
        private String status;
        private Integer duration; // 時長（分鐘）
        private List<TicketTypeClientResponse> tickets; // Add this field
    
        // Add these getter and setter methods
        public List<TicketTypeClientResponse> getTickets() {
            return tickets;
        }
    
        public void setTickets(List<TicketTypeClientResponse> tickets) {
            this.tickets = tickets;
        }
    }
}
