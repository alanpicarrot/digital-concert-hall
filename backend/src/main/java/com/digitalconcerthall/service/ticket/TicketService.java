package com.digitalconcerthall.service.ticket;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.digitalconcerthall.dto.response.ticket.TicketResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;

public interface TicketService {
    
    /**
     * 根據訂單編號生成票券
     * @param orderNumber 訂單編號
     * @return 生成的票券列表
     */
    List<TicketResponse> generateTicketsForOrder(String orderNumber);
    
    /**
     * 獲取當前用戶的所有票券
     * @param pageable 分頁參數
     * @return 票券列表（分頁）
     */
    Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable);
    
    /**
     * 根據票券ID獲取票券詳情
     * @param ticketId 票券ID
     * @return 票券詳情
     */
    TicketResponse getTicketById(Long ticketId);
    
    /**
     * 獲取特定票券的詳細資訊（包含QR碼）
     * @param ticketId 票券ID
     * @return 票券詳細資訊
     */
    UserTicketDetailResponse getUserTicketDetail(Long ticketId);
}
