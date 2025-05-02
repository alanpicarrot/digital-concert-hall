package com.digitalconcerthall.repository.concert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.digitalconcerthall.model.concert.Performance;

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
    @Query("SELECT p FROM Performance p WHERE p.concert.id = :concertId")
    List<Performance> findByConcertId(@Param("concertId") Long concertId);
    
    /**
     * 根據狀態查詢演出場次
     */
    List<Performance> findByStatus(String status);
}
