package com.digitalconcerthall.service.ticket;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.digitalconcerthall.dto.response.ticket.TicketResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.service.order.OrderService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
public class TicketServiceImpl implements TicketService {

    private static final Logger logger = LoggerFactory.getLogger(TicketServiceImpl.class);
    
    
    @Autowired
    private OrderService orderService;

    @Override
    public TicketResponse getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    try {
                        return new TicketResponse(
                                ticket.getId(),
                                ticket.getPerformanceId(),
                                ticket.getSeatNumber(),
                                ticket.getPrice(),
                                ticket.getStatus()
                        // Add other necessary fields as needed
                        );
                    } catch (Exception e) {
                        throw new RuntimeException("Error creating TicketResponse for ticket ID: " + ticketId, e);
                    }
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));
    }

    @Override
    public List<TicketResponse> generateTicketsForOrder(String orderNumber) {
        // Get order entity
        logger.info("Generating tickets for order: {}", orderNumber);
        
        try {
            // Using autowired orderService to get the order
            Order order = orderService.getOrderEntityByOrderNumber(orderNumber);
            List<TicketResponse> generatedTickets = new ArrayList<>();
            
            if (order == null) {
                logger.error("Order not found with number: {}", orderNumber);
                return generatedTickets; // Empty list
            }
            
            List<OrderItem> orderItems = order.getOrderItems();
            if (orderItems == null || orderItems.isEmpty()) {
                logger.warn("No order items found for order: {}", orderNumber);
                return generatedTickets; // Empty list
            }
            
            logger.info("Found {} order items for order: {}", orderItems.size(), orderNumber);
            
            // Process each order item
            for (OrderItem item : orderItems) {
                // Get the ticket from the order item
                Ticket ticket = item.getTicket();
                
                if (ticket == null) {
                    logger.warn("No ticket found for order item in order: {}", orderNumber);
                    continue;
                }
                
                // Convert to response and add to the list
                try {
                    TicketResponse ticketResponse = new TicketResponse(
                            ticket.getId(),
                            ticket.getPerformanceId(),
                            ticket.getSeatNumber(),
                            ticket.getPrice(),
                            "ACTIVE" // Set the ticket to active status
                    );
                    
                    generatedTickets.add(ticketResponse);
                    logger.info("Generated ticket for order item, ticket ID: {}", ticket.getId());
                } catch (Exception e) {
                    logger.error("Error creating ticket response for ticket ID: {}", ticket.getId(), e);
                }
            }
            
            logger.info("Successfully generated {} tickets for order: {}", generatedTickets.size(), orderNumber);
            return generatedTickets;
        } catch (Exception e) {
            // Log the error but don't throw to prevent transaction rollback
            logger.error("Error generating tickets for order: {}", orderNumber, e);
            return new ArrayList<>(); // Return empty list instead of throwing
        }
    }

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    public List<TicketResponse> getTicketsByPerformanceId(Long performanceId) {
        try {
            return ticketRepository.findByPerformance_Id(performanceId)
                    .stream()
                    .map(ticket -> new TicketResponse(
                            ticket.getId(),
                            ticket.getPerformanceId(),
                            ticket.getSeatNumber(),
                            ticket.getPrice(),
                            ticket.getStatus()
                    // Add other necessary fields as needed
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tickets for performance ID: " + performanceId, e);
        }
    }

    @Override
    public Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("Unauthorized access: User is not authenticated.");
            }
            String currentUsername = authentication.getName();
            return ticketRepository.findByUsername(currentUsername, pageable)
                    .map(ticket -> new UserTicketSummaryResponse(
                            ticket.getId(),
                            ticket.getPerformanceId(),
                            ticket.getPerformanceName(),
                            ticket.getPurchaseDate(),
                            ticket.getStatus()
                    // Add other necessary fields as needed
                    ));
        } catch (Exception e) {
            throw new RuntimeException("Error fetching current user tickets.", e);
        }
    }

    @Override
    public UserTicketDetailResponse getUserTicketDetail(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> new UserTicketDetailResponse(
                        ticket.getId(),
                        ticket.getPerformanceId(),
                        ticket.getPerformanceName(),
                        ticket.getPerformanceDate(),
                        ticket.getSeatNumber(),
                        ticket.getPrice(),
                        ticket.getStatus(),
                        ticket.getPurchaseDate()
                // Add other necessary fields as needed
                ))
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));
    }

    @Override
    public void cancelTicket(Long ticketId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("Unauthorized access: User is not authenticated.");
            }

            String currentUsername = authentication.getName();

            // Check if the ticket belongs to the current user
            boolean isUserTicket = ticketRepository.existsByIdAndUsername(ticketId, currentUsername);

            if (!isUserTicket) {
                throw new RuntimeException("Unauthorized: Ticket does not belong to the current user.");
            }

            // Update ticket status instead of deleting
            ticketRepository.updateTicketStatus(ticketId, "CANCELLED");
        } catch (Exception e) {
            throw new RuntimeException("Error canceling ticket with ID: " + ticketId, e);
        }
    }
}
