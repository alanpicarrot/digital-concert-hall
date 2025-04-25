package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.model.User;
import com.digitalconcerthall.repository.RoleRepository;
import com.digitalconcerthall.repository.UserRepository;
import com.digitalconcerthall.security.jwt.JwtUtils;
import com.digitalconcerthall.security.services.UserDetailsImpl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 測試登入控制器，用於提供便捷的前端測試登入功能
 */
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost" }, 
             maxAge = 3600, 
             allowCredentials = "true",
             allowedHeaders = "*")
@RestController
@RequestMapping("/api/test-login")
public class TestLoginController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * 前端測試用的管理員登入端點
     * 如果測試管理員不存在，則自動創建並登入
     * @return JWT 響應
     */
    @PostMapping("/admin")
    public ResponseEntity<?> loginAsTestAdmin() {
        // 測試管理員的憑據
        String username = "admin";
        String password = "admin";

        // 檢查測試管理員是否存在，如不存在則創建
        if (!userRepository.existsByUsername(username)) {
            createTestAdmin(username, password);
        }

        // 執行登入
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                roles));
    }

    /**
     * 創建測試用的管理員帳號
     * @param username 用戶名
     * @param password 密碼
     */
    private void createTestAdmin(String username, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPassword(BCryptPasswordEncoder.encode(password));
        user.setFirstName("Test");
        user.setLastName("Admin");

        // 確保所有角色存在
        ensureRolesExist();

        // 設置角色
        Set<Role> roles = new HashSet<>();
        roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(roles::add);
        roleRepository.findByName(ERole.ROLE_MODERATOR).ifPresent(roles::add);
        roleRepository.findByName(ERole.ROLE_USER).ifPresent(roles::add);
        user.setRoles(roles);

        userRepository.save(user);
    }

    /**
     * 確保所有必要的角色存在
     */
    private void ensureRolesExist() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_MODERATOR));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }
    }

    /**
     * 靜態BCryptPasswordEncoder方法，用於密碼加密
     */
    private static class BCryptPasswordEncoder {
        private static final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        public static String encode(String rawPassword) {
            return encoder.encode(rawPassword);
        }
    }
}
