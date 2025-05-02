package com.digitalconcerthall.service.ticket;

import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserTicketService {

    /**
     * 為指定的訂單號碼生成並保存用戶票券 (UserTicket)。
     * @param orderNumber 訂單號碼
     */
    void generateAndSaveUserTicketsForOrder(String orderNumber);

    /**
     * 獲取當前登入用戶的票券摘要列表（分頁）。
     * @param pageable 分頁信息
     * @return 用戶票券摘要的分頁結果
     */
    Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable);

    /**
     * 根據 UserTicket ID 獲取票券詳細信息。
     * @param userTicketId UserTicket 的 ID
     * @return 用戶票券的詳細信息
     */
    UserTicketDetailResponse getUserTicketDetail(Long userTicketId);

    /**
     * 取消（或標記為已使用）指定的用戶票券。
     * @param userTicketId 要取消的 UserTicket 的 ID
     */
    void cancelTicket(Long userTicketId); // 或者可以命名為 markTicketAsUsed
}