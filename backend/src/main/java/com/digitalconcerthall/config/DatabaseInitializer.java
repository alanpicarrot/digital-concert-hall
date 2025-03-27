package com.digitalconcerthall.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.digitalconcerthall.model.ERole;
import com.digitalconcerthall.model.Role;
import com.digitalconcerthall.repository.RoleRepository;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default roles if they don't exist
        for (ERole role : ERole.values()) {
            if (!roleRepository.findByName(role).isPresent()) {
                roleRepository.save(new Role(role));
            }
        }
    }
}
