package com.digitalconcerthall.repository.concert;

import com.digitalconcerthall.model.concert.Concert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, Long> {
    List<Concert> findByStatus(String status);
}
