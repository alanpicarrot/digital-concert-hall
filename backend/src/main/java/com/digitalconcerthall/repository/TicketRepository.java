package com.digitalconcerthall.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.digitalconcerthall.model.ticket.Ticket;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    /**
     * 根據演出場次ID查詢票券
     */
    List<Ticket> findByPerformance_Id(Long performanceId);
    
    /**
     * 根據票種ID查詢票券
     */
    List<Ticket> findByTicketTypeId(Long ticketTypeId);
    
    /**
     * 根據演出場次ID和票種ID查詢票券
     */
    Optional<Ticket> findByPerformance_IdAndTicketType_Id(Long performanceId, Long ticketTypeId);

    /**
     * 根據用戶名分頁查詢票券
     */
    Page<Ticket> findByUsername(String username, Pageable pageable);
    
    /**
     * 查詢當前用戶的票券
     */
    @Query("SELECT t FROM Ticket t WHERE t.username = ?#{principal.username}")
    Page<Ticket> findCurrentUserTickets(Pageable pageable);
    
    /**
     * 根據用戶名查詢當前用戶的票券
     */
    Page<Ticket> findCurrentUserTicketsByUsername(String username, Pageable pageable);
    
    /**
     * 檢查票券是否屬於特定用戶
     */
    boolean existsByIdAndUsername(Long id, String username);
    
    /**
     * 更新票券狀態
     */
    @Modifying
    @Transactional
    @Query("UPDATE Ticket t SET t.status = :status WHERE t.id = :id")
    void updateTicketStatus(Long id, String status);
}
