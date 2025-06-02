package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.AdminUser;
import com.digitalconcerthall.repository.AdminUserRepository;
import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.AdminUserDetailsImpl;
import com.digitalconcerthall.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

@Service
public class AdminAuthServiceImpl implements AdminAuthService {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthServiceImpl.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DaoAuthenticationProvider adminAuthenticationProvider;

    @Override
    public AdminUserLoginResponse authenticateAdmin(LoginRequest loginRequest) {
        try {
            logger.info("AdminAuthServiceImpl: Attempting to authenticate admin user: {}",
                    loginRequest.getIdentifier());
            logger.info("AdminAuthServiceImpl: LoginRequest details - identifier: {}, username: {}, password: {}",
                    loginRequest.getIdentifier(), loginRequest.getUsername(),
                    loginRequest.getPassword() != null ? "[PROVIDED]" : "[NULL]");
            logger.info("AdminAuthServiceImpl: Using adminAuthenticationProvider: {}",
                    adminAuthenticationProvider.getClass().getName());

            Authentication authentication = adminAuthenticationProvider.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            AdminUserDetailsImpl adminUserDetails = (AdminUserDetailsImpl) authentication.getPrincipal();

            logger.info("AdminAuthServiceImpl: Authentication successful for user: {}", adminUserDetails.getUsername());

            return new AdminUserLoginResponse(
                    jwt,
                    adminUserDetails.getId(),
                    adminUserDetails.getUsername(),
                    adminUserDetails.getEmail(),
                    adminUserDetails.getAuthorities().stream()
                            .map(item -> item.getAuthority())
                            .collect(Collectors.toList()));
        } catch (BadCredentialsException e) {
            logger.warn("Admin authentication failed for user {}: Bad credentials", loginRequest.getIdentifier());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "帳號或密碼錯誤", e);
        } catch (UsernameNotFoundException e) {
            logger.warn("Admin authentication failed: User identified by {} not found", loginRequest.getIdentifier());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "管理員不存在", e);
        } catch (AuthenticationException e) {
            logger.warn("Admin authentication failed for user {}: {}", loginRequest.getIdentifier(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "認證失敗: " + e.getMessage(), e);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            logger.error("Unexpected error during admin authentication for user: {}", loginRequest.getIdentifier(), e);
            String errorMessage = String.format("登入時發生內部錯誤: %s - %s",
                    e.getClass().getSimpleName(),
                    e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage, e);
        }
    }

    @Override
    public MessageResponse registerAdmin(AdminUserCreateRequest signUpRequest) {
        if (adminUserRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("用戶名已被使用!");
        }
        if (adminUserRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("電子郵件已被使用!");
        }
        // Assuming AdminUser model exists
        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(signUpRequest.getUsername());
        adminUser.setEmail(signUpRequest.getEmail());
        adminUser.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        // Set roles as needed, e.g., fetch ROLE_ADMIN from RoleRepository and assign
        // Set<Role> roles = new HashSet<>();
        // Role adminRole =
        // roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow(...);
        // roles.add(adminRole);
        // adminUser.setRoles(roles);
        adminUserRepository.save(adminUser);
        return new MessageResponse("管理員創建成功!");
    }
}