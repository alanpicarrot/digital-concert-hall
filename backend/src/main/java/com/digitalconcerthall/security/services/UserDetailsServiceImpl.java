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
        
        // 記錄參數類型以進行排錯
        System.out.println("Username parameter type: " + (username != null ? username.getClass().getName() : "null"));
        
        if (username == null || username.trim().isEmpty()) {
            System.out.println("Username is null or empty");
            throw new UsernameNotFoundException("Username cannot be null or empty");
        }
        
        // 先嘗試以用戶名查找
        System.out.println("Attempting to find user by username: " + username);
        User user = userRepository.findByUsername(username.trim())
                .orElse(null);
        
        if (user != null) {
            System.out.println("User found by username: " + username);
        } else {
            System.out.println("User not found by username, trying email: " + username);
            // 如果找不到用戶，嘗試以電子郵件查找
            try {
                System.out.println("User not found by username, trying email: " + username);
                
                // 嘗試確認在資料庫中是否存在非空的使用者
                long userCount = userRepository.count();
                System.out.println("Total user count in database: " + userCount);
                
                user = userRepository.findByEmail(username.trim())
                        .orElse(null);
                
                if (user != null) {
                    System.out.println("User found by email: " + username);
                    System.out.println("Found user details: ID=" + user.getId() + ", Username=" + user.getUsername());
                } else {
                    System.out.println("User not found by email either: " + username);
                    // 原因說明
                    String errorMessage = "User Not Found with username or email: " + username;
                    errorMessage += " (Searched in database with " + userCount + " users)";
                    throw new UsernameNotFoundException(errorMessage);
                }
            } catch (Exception e) {
                System.out.println("Exception when finding by email: " + e.getMessage());
                e.printStackTrace();
                throw new UsernameNotFoundException("User Not Found with username or email: " + username, e);
            }
        }

        return UserDetailsImpl.build(user);
    }
}
