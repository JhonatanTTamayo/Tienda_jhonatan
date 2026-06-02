package com.example.TiendaJhonatan.products.infrastructure;

import com.example.TiendaJhonatan.products.application.ProductService;
import com.example.TiendaJhonatan.products.domain.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> findAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(productService.searchByName(search));
        }
        return ResponseEntity.ok(productService.findActive());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> findLowStock() {
        return ResponseEntity.ok(productService.findLowStock());
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Product>> findOutOfStock() {
        return ResponseEntity.ok(productService.findOutOfStock());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        return ResponseEntity.ok(productService.create(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable UUID id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Producto eliminado"));
    }
}