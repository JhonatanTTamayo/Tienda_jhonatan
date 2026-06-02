package com.example.TiendaJhonatan.products.application;

import com.example.TiendaJhonatan.products.domain.Product;
import com.example.TiendaJhonatan.products.domain.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<Product> findActive() {
        return productRepository.findByActiveTrue();
    }

    public Product findById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> findLowStock() {
        return productRepository.findLowStock();
    }

    public List<Product> findOutOfStock() {
        return productRepository.findOutOfStock();
    }

    public Product create(Product product) {
        product.setId(null);
        product.setActive(true);
        return productRepository.save(product);
    }

    public Product update(UUID id, Product updatedProduct) {
        Product existing = findById(id);
        existing.setCode(updatedProduct.getCode());
        existing.setName(updatedProduct.getName());
        existing.setCategoryId(updatedProduct.getCategoryId());
        existing.setPurchasePrice(updatedProduct.getPurchasePrice());
        existing.setSalePrice(updatedProduct.getSalePrice());
        existing.setStock(updatedProduct.getStock());
        existing.setMinimumStock(updatedProduct.getMinimumStock());
        return productRepository.save(existing);
    }

    public void delete(UUID id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
    }
}