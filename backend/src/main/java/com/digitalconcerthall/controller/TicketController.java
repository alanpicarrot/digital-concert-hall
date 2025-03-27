package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.service.ticket.TicketService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users/me")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    /**
     * 獲取當前登錄用戶的所有票券
     */
    @GetMapping("/tickets")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<UserTicketSummaryResponse>> getCurrentUserTickets(
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<UserTicketSummaryResponse> tickets = ticketService.getCurrentUserTickets(pageable);
        return ResponseEntity.ok(tickets);
    }
    
    /**
     * 獲取特定票券的詳細資訊（包含QR碼）
     */
    @GetMapping("/tickets/{ticketId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<UserTicketDetailResponse> getUserTicketDetail(
            @PathVariable Long ticketId) {
        
        UserTicketDetailResponse ticket = ticketService.getUserTicketDetail(ticketId);
        return ResponseEntity.ok(ticket);
    }
}
