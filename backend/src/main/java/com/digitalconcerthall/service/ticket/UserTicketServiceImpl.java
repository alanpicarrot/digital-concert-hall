package com.digitalconcerthall.service.ticket;

import com.digitalconcerthall.dto.response.ticket.UserTicketDetailResponse;
import com.digitalconcerthall.dto.response.ticket.UserTicketSummaryResponse;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.model.order.OrderItem;
import com.digitalconcerthall.model.ticket.UserTicket;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.repository.UserTicketRepository;
import com.digitalconcerthall.service.order.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

// Import necessary classes for other methods if implementing them here
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.Authentication;

@Service
public class UserTicketServiceImpl implements UserTicketService {

    private static final Logger logger = LoggerFactory.getLogger(UserTicketServiceImpl.class);

    @Autowired
    private UserTicketRepository userTicketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService; // Assuming OrderService can provide Order details

    @Override
    @Transactional // Add Transactional annotation for database operations
    public void generateAndSaveUserTicketsForOrder(String orderNumber) {
        logger.info("Generating user tickets for order: {}", orderNumber);
        try {
            Order order = orderService.getOrderEntityByOrderNumber(orderNumber);
            if (order == null) {
                logger.error("Order not found with number: {}", orderNumber);
                // Consider throwing a specific exception like OrderNotFoundException
                throw new RuntimeException("Order not found: " + orderNumber);
            }
            if (order.getUser() == null) {
                logger.error("Order {} has no associated user.", orderNumber);
                // Consider throwing an exception
                throw new RuntimeException("Order has no associated user: " + orderNumber);
            }

            List<OrderItem> orderItems = order.getOrderItems();
            if (orderItems == null || orderItems.isEmpty()) {
                logger.warn("No order items found for order: {}", orderNumber);
                return; // Nothing to generate
            }

            List<UserTicket> generatedUserTickets = new ArrayList<>();
            for (OrderItem item : orderItems) {
                // Basic validation: Check if OrderItem has a link to the inventory Ticket
                if (item.getTicket() == null) {
                    logger.warn(
                            "Order item ID {} in order {} has no associated inventory ticket. Skipping generation for this item.",
                            item.getId(), orderNumber);
                    continue;
                }
                // Basic validation: Check quantity
                if (item.getQuantity() <= 0) {
                    logger.warn("Order item ID {} in order {} has invalid quantity {}. Skipping generation.",
                            item.getId(), orderNumber, item.getQuantity());
                    continue;
                }

                // Create 'quantity' number of UserTickets for this OrderItem
                for (int i = 0; i < item.getQuantity(); i++) {
                    UserTicket userTicket = new UserTicket();
                    userTicket.setUser(order.getUser());
                    userTicket.setOrderItem(item);
                    // ticketCode, isUsed, createdAt, updatedAt are handled by @PrePersist in
                    // UserTicket entity
                    generatedUserTickets.add(userTicket);
                }
                logger.debug("Prepared {} UserTicket(s) for OrderItem ID {}", item.getQuantity(), item.getId());
            }

            // Save all generated UserTickets in a batch
            if (!generatedUserTickets.isEmpty()) {
                userTicketRepository.saveAll(generatedUserTickets);
                logger.info("Successfully generated and saved {} user tickets for order: {}",
                        generatedUserTickets.size(), orderNumber);
            } else {
                logger.warn("No user tickets were generated for order: {}", orderNumber);
            }

        } catch (Exception e) {
            logger.error("Error generating user tickets for order: {}", orderNumber, e);
            // Re-throw as a runtime exception to potentially trigger transaction rollback
            throw new RuntimeException("Error generating user tickets for order: " + orderNumber, e);
        }
    }

    @Override
    public Page<UserTicketSummaryResponse> getCurrentUserTickets(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Page<UserTicket> userTicketsPage = userTicketRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return userTicketsPage.map(this::mapToUserTicketSummaryResponse);
    }

    @Override
    public UserTicketDetailResponse getUserTicketDetail(Long userTicketId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        UserTicket userTicket = userTicketRepository.findByIdAndUser(userTicketId, user)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found or not owned by user"));

        return mapToUserTicketDetailResponse(userTicket);
    }

    @Override
    @Transactional
    public void cancelTicket(Long userTicketId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        UserTicket userTicket = userTicketRepository.findByIdAndUser(userTicketId, user)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found or not owned by user"));

        if (userTicket.getIsUsed()) {
            throw new IllegalStateException("Ticket already used/cancelled");
        }

        userTicket.setIsUsed(true);
        userTicketRepository.save(userTicket);
        logger.info("Ticket {} cancelled successfully", userTicketId);
    }

    private UserTicketSummaryResponse mapToUserTicketSummaryResponse(UserTicket userTicket) {
        OrderItem orderItem = userTicket.getOrderItem();
        return new UserTicketSummaryResponse(
                userTicket.getId(),
                userTicket.getTicketCode(),
                orderItem.getTicket().getPerformanceName(),
                orderItem.getTicket().getPerformance().getVenue(),
                orderItem.getTicket().getPerformanceDate(),
                orderItem.getTicket().getPerformance().getEndTime(),
                orderItem.getTicket().getTicketTypeName(),
                userTicket.getIsUsed(),
                orderItem.getOrder().getOrderNumber(),
                userTicket.getCreatedAt());
    }

    private UserTicketDetailResponse mapToUserTicketDetailResponse(UserTicket userTicket) {
        OrderItem orderItem = userTicket.getOrderItem();
        return new UserTicketDetailResponse(
                userTicket.getId(),
                userTicket.getTicketCode(),
                orderItem.getTicket().getPerformanceName(),
                orderItem.getTicket().getPerformance().getVenue(),
                orderItem.getTicket().getPerformanceDate(),
                orderItem.getTicket().getPerformance().getEndTime(),
                orderItem.getTicket().getTicketTypeName(),
                userTicket.getIsUsed(),
                orderItem.getOrder().getOrderNumber(),
                userTicket.getCreatedAt(),
                null, // qrCodeBase64
                null, // posterUrl
                null, // concertDescription
                null // programDetails
        );
    }
}