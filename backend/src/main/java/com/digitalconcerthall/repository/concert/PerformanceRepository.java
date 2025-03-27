package com.digitalconcerthall.repository.concert;

import com.digitalconcerthall.model.concert.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    
    /**
     * 查找狀態不是指定值的第一個演出
     */
    Optional<Performance> findFirstByStatusNot(String status);
    
    /**
     * 根據音樂會ID查詢演出場次
     */
    List<Performance> findByConcertId(Long concertId);
    
    /**
     * 根據狀態查詢演出場次
     */
    List<Performance> findByStatus(String status);
}
