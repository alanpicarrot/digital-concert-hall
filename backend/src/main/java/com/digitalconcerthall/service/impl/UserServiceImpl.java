package com.digitalconcerthall.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.dto.request.PasswordUpdateRequest;
import com.digitalconcerthall.dto.request.UserUpdateRequest;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.dto.response.UserInfoResponse;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserInfoResponse getCurrentUserInfo() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        return new UserInfoResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles
        );
    }

    @Override
    @Transactional
    public MessageResponse updateUserInfo(UserUpdateRequest updateRequest) {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
        
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            // Check if email is already taken
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                return new MessageResponse("Error: Email is already in use!");
            }
            user.setEmail(updateRequest.getEmail());
        }
        
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        
        userRepository.save(user);
        
        return new MessageResponse("User information updated successfully!");
    }

    @Override
    @Transactional
    public MessageResponse updatePassword(PasswordUpdateRequest passwordUpdateRequest) {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
        
        // Verify current password
        if (!passwordEncoder.matches(passwordUpdateRequest.getCurrentPassword(), user.getPassword())) {
            return new MessageResponse("Error: Current password is incorrect!");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(passwordUpdateRequest.getNewPassword()));
        userRepository.save(user);
        
        return new MessageResponse("Password updated successfully!");
    }
    
    private UserDetailsImpl getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        
        return (UserDetailsImpl) authentication.getPrincipal();
    }
    
    @Override
    public User getCurrentUser() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
    }
}
