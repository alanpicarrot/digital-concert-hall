package com.digitalconcerthall.service.ticket;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.digitalconcerthall.dto.response.ticket.TicketResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class TicketServiceImpl implements TicketService { // Should only implement TicketService now

    private static final Logger logger = LoggerFactory.getLogger(TicketServiceImpl.class);

    // Keep TicketRepository for inventory operations
    @Autowired
    private TicketRepository ticketRepository;

    @Override
    public TicketResponse getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    try {
                        java.math.BigDecimal price = (ticket.getTicketType() != null) ? ticket.getTicketType().getPrice() : java.math.BigDecimal.ZERO;
                        return new TicketResponse(
                                ticket.getId(),
                                ticket.getPerformanceId(),
                                null, // Inventory has no seat number
                                price, // Price from TicketType
                                ticket.getStatus()
                        );
                    } catch (Exception e) {
                        logger.error("Error creating TicketResponse for ticket ID: {}", ticketId, e);
                        throw new RuntimeException("Error creating TicketResponse for ticket ID: " + ticketId, e);
                    }
                })
                .orElseThrow(() -> new RuntimeException("Ticket (Inventory) not found with ID: " + ticketId));
    }


    @Override
    public List<TicketResponse> getTicketsByPerformanceId(Long performanceId) {
        try {
            return ticketRepository.findByPerformance_Id(performanceId)
                    .stream()
                    .map(ticket -> {
                        java.math.BigDecimal price = (ticket.getTicketType() != null) ? ticket.getTicketType().getPrice() : java.math.BigDecimal.ZERO;
                        return new TicketResponse(
                                ticket.getId(),
                                ticket.getPerformanceId(),
                                null, // Inventory has no seat number
                                price, // Price from TicketType
                                ticket.getStatus()
                        );
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching tickets (inventory) for performance ID: {}", performanceId, e);
            throw new RuntimeException("Error fetching tickets (inventory) for performance ID: " + performanceId, e);
        }
    }


    // --- Remove or Mark Deprecated Methods related to User Tickets ---
    // These responsibilities now belong to UserTicketService

    @Deprecated
    @Override
    public Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable) {
        logger.error("getCurrentUserTickets is deprecated in TicketServiceImpl. Use UserTicketService instead.");
        throw new UnsupportedOperationException("This method is deprecated. Use UserTicketService.");
    }

    @Deprecated
    @Override
    public UserTicketDetailResponse getUserTicketDetail(Long userTicketId) {
        logger.error("getUserTicketDetail is deprecated in TicketServiceImpl. Use UserTicketService instead.");
        throw new UnsupportedOperationException("This method is deprecated. Use UserTicketService.");
    }

    @Deprecated
    @Override
    public void cancelTicket(Long userTicketId) {
        logger.error("cancelTicket is deprecated in TicketServiceImpl. Use UserTicketService instead.");
        throw new UnsupportedOperationException("This method is deprecated. Use UserTicketService.");
    }

    @Deprecated
    @Override
    public List<TicketResponse> generateTicketsForOrder(String orderNumber) {
         logger.error("generateTicketsForOrder is deprecated in TicketServiceImpl. Use UserTicketService.generateAndSaveUserTicketsForOrder instead.");
         throw new UnsupportedOperationException("This method is deprecated. Use UserTicketService.");
    }

    // Remove the generateAndSaveUserTicketsForOrder method completely from here
    /*
    public void generateAndSaveUserTicketsForOrder(String orderNumber) {
        // ... logic moved to UserTicketServiceImpl ...
    }
    */
}
