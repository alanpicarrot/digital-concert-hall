package com.digitalconcerthall.service.impl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.SignupRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.UserDetailsImpl;
import com.digitalconcerthall.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public JwtResponse authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles);
    }

    @Override
    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    @Override
    @Transactional
    public MessageResponse registerAdminUser(SignupRequest signUpRequest) {
        // 檢查用戶名是否已存在
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        // 檢查郵箱是否已存在
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // 創建新用戶帳號
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        // 確保角色存在
        createRoleIfNotExists(ERole.ROLE_USER);
        createRoleIfNotExists(ERole.ROLE_MODERATOR);
        createRoleIfNotExists(ERole.ROLE_ADMIN);

        // 無論請求中的角色如何，都將其設置為管理員
        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
        roles.add(adminRole);

        // 同時添加用戶角色
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: User Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("Admin user registered successfully!");
    }

    private void createRoleIfNotExists(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = new Role(roleName);
            roleRepository.save(role);
        }
    }

    @Override
    public MessageResponse logoutUser() {
        SecurityContextHolder.clearContext();
        return new MessageResponse("Logout successful!");
    }

    @Override
    @Transactional
    public MessageResponse requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not Found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        userRepository.save(user);

        // Send email with reset link
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n\n"
                + "http://localhost:3000/reset-password?token=" + token);

        mailSender.send(message);

        return new MessageResponse("Password reset email sent successfully!");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        // Check if token is expired
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        // Update password and clear token
        user.setPassword(encoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return new MessageResponse("Password has been reset successfully!");
    }
}