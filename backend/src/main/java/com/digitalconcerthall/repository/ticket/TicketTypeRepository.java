package com.digitalconcerthall.repository.ticket;

import com.digitalconcerthall.model.ticket.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    
    /**
     * 根據名稱查詢票券類型
     */
    Optional<TicketType> findByName(String name);
}
