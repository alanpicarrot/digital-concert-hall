package com.digitalconcerthall.service.impl;

import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.request.AdminUserCreateRequest;
import com.digitalconcerthall.dto.response.AdminUserLoginResponse;
import com.digitalconcerthall.dto.response.MessageResponse;
import com.digitalconcerthall.model.AdminUser; // Assuming you have this model
import com.digitalconcerthall.repository.AdminUserRepository; // Assuming you have this repository
import com.digitalconcerthall.security.jwt.JwtUtils; // Import JwtUtils
import com.digitalconcerthall.security.services.AdminUserDetailsImpl; // Assuming you have this
import com.digitalconcerthall.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException; // Import AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger; // Add logger import
import org.slf4j.LoggerFactory; // Add logger import

@Service // Ensure @Service annotation is present
public class AdminAuthServiceImpl implements AdminAuthService { // Ensure it implements the interface

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthServiceImpl.class); // Add logger

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminUserRepository adminUserRepository; // Assuming you have this

    @Autowired
    private PasswordEncoder passwordEncoder; // Ensure PasswordEncoder is injected

    @Override
    public AdminUserLoginResponse authenticateAdmin(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            Object principal = authentication.getPrincipal();
            AdminUserDetailsImpl userDetails;

            // Check the type of the principal before casting
            if (principal instanceof AdminUserDetailsImpl) {
                userDetails = (AdminUserDetailsImpl) principal;
            } else {
                // Log the unexpected principal type
                logger.error("Unexpected principal type during admin authentication for user: {}. Expected AdminUserDetailsImpl, but got {}",
                             loginRequest.getUsername(), principal != null ? principal.getClass().getName() : "null");
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "管理員認證配置錯誤"); // More specific error
            }

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // This check is likely redundant if authentication succeeded with the correct UserDetailsService
            // if (!adminUserRepository.existsByUsername(userDetails.getUsername())) {
            //      logger.warn("Admin user {} authenticated but not found in repository during final check.", userDetails.getUsername());
            //      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "管理員不存在");
            // }

            // Assuming AdminUserLoginResponse constructor matches
            // Corrected constructor call: added "Bearer" for tokenType
            return new AdminUserLoginResponse(jwt,
                    "Bearer", // Add the tokenType explicitly
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(), // Assuming email is available in UserDetailsImpl
                    roles);
        } catch (BadCredentialsException e) {
             logger.warn("Admin authentication failed for user {}: Bad credentials", loginRequest.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "帳號或密碼錯誤", e);
        } catch (UsernameNotFoundException e) {
             logger.warn("Admin authentication failed: Username {} not found", loginRequest.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "管理員不存在", e);
        } catch (AuthenticationException e) {
             logger.warn("Admin authentication failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "認證失敗: " + e.getMessage(), e);
        } catch (ResponseStatusException rse) {
            // Re-throw specific ResponseStatusExceptions like the one added above
            throw rse;
        } catch (Exception e) {
            // Log the unexpected error with stack trace
            logger.error("Unexpected error during admin authentication for user: {}", loginRequest.getUsername(), e);
            // Keep original message for consistency, but the root cause is logged above
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "登入時發生內部錯誤", e);
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
        // Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow(...);
        // roles.add(adminRole);
        // adminUser.setRoles(roles);
        adminUserRepository.save(adminUser);
        return new MessageResponse("管理員創建成功!");
    }
}