package com.example.TiendaJhonatan.customers.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByStatus(String status);
    List<Customer> findByFullNameContainingIgnoreCase(String fullName);
    boolean existsByDocument(String document);
}