package com.digitalconcerthall.service.ticket;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.digitalconcerthall.dto.response.ticket.TicketResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.exception.ResourceNotFoundException;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.UserTicket;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.service.order.OrderService;

@Service
public class TicketServiceImpl implements TicketService {

    private static final Logger logger = LoggerFactory.getLogger(TicketServiceImpl.class);
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.digitalconcerthall.repository.UserTicketRepository userTicketRepository;

    @Override
    public List<TicketResponse> generateTicketsForOrder(String orderNumber) {
        logger.info("Generating tickets for order: {}", orderNumber);
        
        // 獲取訂單信息
        Order order = orderService.getOrderEntityByOrderNumber(orderNumber);
        
        // 檢查訂單狀態，只為已支付的訂單生成票券
        if (!"paid".equals(order.getStatus())) {
            logger.warn("Cannot generate tickets for unpaid order: {}", orderNumber);
            return new ArrayList<>();
        }
        
        List<TicketResponse> generatedTickets = new ArrayList<>();
        
        // 對訂單中的每個項目生成票券
        for (OrderItem item : order.getOrderItems()) {
            for (int i = 0; i < item.getQuantity(); i++) {
                UserTicket userTicket = new UserTicket();
                userTicket.setTicketCode(generateTicketCode());
                userTicket.setUser(order.getUser());
                userTicket.setOrderItem(item);
                userTicketRepository.save(userTicket);
                
                TicketResponse response = new TicketResponse();
                response.setId(userTicket.getId());
                response.setTicketCode(userTicket.getTicketCode());
                response.setConcertTitle(item.getTicket().getPerformance().getConcert().getTitle());
                response.setPerformanceVenue(item.getTicket().getPerformance().getVenue());
                response.setPerformanceStartTime(item.getTicket().getPerformance().getStartTime());
                response.setPerformanceEndTime(item.getTicket().getPerformance().getEndTime());
                response.setTicketTypeName(item.getTicket().getTicketType().getName());
                response.setUsed(userTicket.getIsUsed());
                response.setCreatedAt(userTicket.getCreatedAt());
                
                generatedTickets.add(response);
            }
        }
        
        logger.info("Generated {} tickets for order: {}", generatedTickets.size(), orderNumber);
        return generatedTickets;
    }

    @Override
    public Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable) {
        User currentUser = getCurrentUser();
        
        Page<UserTicket> userTickets = userTicketRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
        
        // 修正：添加空值檢查
        return userTickets.map(ticket -> {
            OrderItem orderItem = ticket.getOrderItem();
            if (orderItem == null) {
                logger.error("Invalid ticket data for ticketId: {}", ticket.getId());
                return new UserTicketSummaryResponse(); // 或拋出自定義異常
            }
            
            UserTicketSummaryResponse response = new UserTicketSummaryResponse();
            
            response.setId(ticket.getId());
            response.setTicketCode(ticket.getTicketCode());
            response.setConcertTitle(orderItem.getTicket().getPerformance().getConcert().getTitle());
            response.setPerformanceVenue(orderItem.getTicket().getPerformance().getVenue());
            response.setPerformanceStartTime(orderItem.getTicket().getPerformance().getStartTime());
            response.setPerformanceEndTime(orderItem.getTicket().getPerformance().getEndTime());
            response.setTicketTypeName(orderItem.getTicket().getTicketType().getName());
            response.setIsUsed(ticket.getIsUsed());
            response.setOrderNumber(orderItem.getOrder().getOrderNumber());
            response.setCreatedAt(ticket.getCreatedAt());
            
            return response;
        });
    }

    @Override
    public TicketResponse getTicketById(Long ticketId) {
        // TODO: 實現按ID查詢票券詳情
        
        return new TicketResponse();
    }
    
    @Override
    public UserTicketDetailResponse getUserTicketDetail(Long ticketId) {
        // TODO: 實現票券詳細信息查詢功能，包含生成QR碼
        
        return new UserTicketDetailResponse();
    }
    
    /**
     * 生成唯一的票券代碼
     */
    private String generateTicketCode() {
        return "TIX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * 獲取當前登錄用戶
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }
}
