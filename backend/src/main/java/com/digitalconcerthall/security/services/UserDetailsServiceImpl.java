package com.digitalconcerthall.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("loadUserByUsername called with: " + username);
        
        // 先嘗試以用戶名查找
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user != null) {
            System.out.println("User found by username: " + username);
        } else {
            System.out.println("User not found by username, trying email: " + username);
            // 如果找不到用戶，嘗試以電子郵件查找
            try {
                user = userRepository.findByEmail(username)
                        .orElse(null);
                if (user != null) {
                    System.out.println("User found by email: " + username);
                } else {
                    System.out.println("User not found by email either: " + username);
                    throw new UsernameNotFoundException("User Not Found with username or email: " + username);
                }
            } catch (Exception e) {
                System.out.println("Exception when finding by email: " + e.getMessage());
                throw new UsernameNotFoundException("User Not Found with username or email: " + username, e);
            }
        }

        return UserDetailsImpl.build(user);
    }
}
