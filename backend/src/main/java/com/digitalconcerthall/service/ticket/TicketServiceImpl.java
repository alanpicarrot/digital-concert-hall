package com.digitalconcerthall.service.ticket;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.digitalconcerthall.dto.response.ticket.TicketResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.repository.TicketRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
public class TicketServiceImpl implements TicketService {

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
    public List<TicketResponse> generateTicketsForOrder(String orderId) {
        // Implementation logic for generating tickets for an order
        // Example: ticketRepository.generateTickets(orderId);
        throw new UnsupportedOperationException("Method not implemented yet.");
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
