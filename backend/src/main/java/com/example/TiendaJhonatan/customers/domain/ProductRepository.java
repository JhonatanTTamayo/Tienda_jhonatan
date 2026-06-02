package com.example.TiendaJhonatan.products.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByActiveTrue();
    List<Product> findByNameContainingIgnoreCase(String name);
    boolean existsByCode(String code);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= p.minimumStock")
    List<Product> findLowStock();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock = 0")
    List<Product> findOutOfStock();
}