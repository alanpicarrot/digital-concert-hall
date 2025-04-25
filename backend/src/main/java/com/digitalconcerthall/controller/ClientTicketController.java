package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ticket.TicketTypeClientResponse;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 客戶端票券控制器
 * 處理前台客戶查詢票券相關的請求
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ClientTicketController {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    /**
     * 根據演出場次ID獲取可購買的票券列表
     * @param performanceId 演出場次ID
     * @return 票券列表
     */
    @GetMapping("/performances/{performanceId}/tickets")
    public ResponseEntity<List<TicketTypeClientResponse>> getTicketsByPerformanceId(
            @PathVariable("performanceId") Long performanceId) {
        
        List<Ticket> tickets = ticketRepository.findByPerformance_Id(performanceId);
        
        List<TicketTypeClientResponse> responses = tickets.stream()
                .filter(ticket -> ticket.getAvailableQuantity() > 0) // 只返回有庫存的票券
                .map(ticket -> {
                    TicketType ticketType = ticket.getTicketType();
                    
                    TicketTypeClientResponse response = new TicketTypeClientResponse();
                    response.setId(ticket.getId());
                    response.setTicketTypeId(ticketType.getId());
                    response.setName(ticketType.getName());
                    response.setDescription(ticketType.getDescription());
                    response.setPrice(ticketType.getPrice());
                    response.setColorCode(ticketType.getColorCode());
                    response.setAvailableQuantity(ticket.getAvailableQuantity());
                    response.setPerformanceId(performanceId);
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * 獲取票券詳情
     * @param ticketId 票券ID
     * @return 票券詳情
     */
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<TicketTypeClientResponse> getTicketById(
            @PathVariable("ticketId") Long ticketId) {
        
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketType ticketType = ticket.getTicketType();
                    
                    TicketTypeClientResponse response = new TicketTypeClientResponse();
                    response.setId(ticket.getId());
                    response.setTicketTypeId(ticketType.getId());
                    response.setName(ticketType.getName());
                    response.setDescription(ticketType.getDescription());
                    response.setPrice(ticketType.getPrice());
                    response.setColorCode(ticketType.getColorCode());
                    response.setAvailableQuantity(ticket.getAvailableQuantity());
                    response.setPerformanceId(ticket.getPerformance().getId());
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 獲取所有票種
     * @return 票種列表
     */
    @GetMapping("/ticket-types")
    public ResponseEntity<List<TicketType>> getAllTicketTypes() {
        return ResponseEntity.ok(ticketTypeRepository.findAll());
    }
}
