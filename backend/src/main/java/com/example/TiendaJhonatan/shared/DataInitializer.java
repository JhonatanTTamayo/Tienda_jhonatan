package com.example.TiendaJhonatan.shared;

import com.example.TiendaJhonatan.security.domain.Role;
import com.example.TiendaJhonatan.security.domain.User;
import com.example.TiendaJhonatan.security.domain.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           EntityManager entityManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            Role adminRole = entityManager.createQuery(
                "SELECT r FROM Role r WHERE r.name = 'ADMIN'", Role.class).getSingleResult();
            Role employeeRole = entityManager.createQuery(
                "SELECT r FROM Role r WHERE r.name = 'EMPLOYEE'", Role.class).getSingleResult();

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Administrador")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .roles(Set.of(adminRole, employeeRole))
                    .build();

            User employee = User.builder()
                    .username("empleado")
                    .password(passwordEncoder.encode("empleado123"))
                    .fullName("Juan P\u00e9rez")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .roles(Set.of(employeeRole))
                    .build();

            userRepository.save(admin);
            userRepository.save(employee);

            System.out.println("========================================");
            System.out.println("  USUARIOS DE PRUEBA CREADOS");
            System.out.println("  Admin    : admin / admin123");
            System.out.println("  Empleado : empleado / empleado123");
            System.out.println("========================================");
        }
    }
}