package com.digitalconcerthall.repository;

import com.digitalconcerthall.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByResetPasswordToken(String token);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
}
