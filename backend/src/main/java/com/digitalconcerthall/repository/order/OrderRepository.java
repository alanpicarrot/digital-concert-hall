package com.digitalconcerthall.repository.order;

import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    Page<Order> findByUser(User user, Pageable pageable);
    
    Optional<Order> findByOrderNumber(String orderNumber);
}
