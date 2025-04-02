package com.digitalconcerthall.repository.order;

import com.digitalconcerthall.model.User;
import com.digitalconcerthall.model.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * 檢查指定訂單號的訂單是否存在（輕量級檢查，不返回完整實體）
     * @param orderNumber 訂單號
     * @return 是否存在
     */
    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.orderNumber = :orderNumber")
    boolean existsByOrderNumber(@Param("orderNumber") String orderNumber);
    
    /**
     * 查找最近創建的訂單（用於診斷無法找到訂單的情況）
     * @param limit 返回數量限制
     * @return 最近創建的訂單列表
     */
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(Pageable pageable);
}
