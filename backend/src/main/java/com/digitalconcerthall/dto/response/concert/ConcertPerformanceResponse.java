package com.digitalconcerthall.dto.response.concert;

import com.digitalconcerthall.dto.response.ticket.TicketTypeClientResponse; // 新增導入
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ConcertPerformanceResponse {
    private List<PerformanceInfo> performances;

    @Data
    @NoArgsConstructor
    public static class PerformanceInfo {
        private int duration;
        private List<TicketTypeClientResponse> tickets; // 使用 TicketTypeClientResponse
    }
}