package com.digitalconcerthall.repository.ticket;

import com.digitalconcerthall.model.ticket.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    /**
     * 根據演出場次ID查詢票券
     */
    List<Ticket> findByPerformanceId(Long performanceId);
    
    /**
     * 根據票種ID查詢票券
     */
    List<Ticket> findByTicketTypeId(Long ticketTypeId);
    
    /**
     * 根據演出場次ID和票種ID查詢票券
     */
    Optional<Ticket> findByPerformanceIdAndTicketTypeId(Long performanceId, Long ticketTypeId);
}
