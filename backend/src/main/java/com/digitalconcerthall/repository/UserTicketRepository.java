package com.digitalconcerthall.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.ticket.UserTicket;

import java.util.Optional;

@Repository
public interface UserTicketRepository extends JpaRepository<UserTicket, Long> {
    Page<UserTicket> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<UserTicket> findByUser(User user, Pageable pageable);
    
    Optional<UserTicket> findByTicketCode(String ticketCode);
    
    Optional<UserTicket> findByIdAndUser(Long id, User user);
}