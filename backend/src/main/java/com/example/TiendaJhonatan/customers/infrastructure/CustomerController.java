package com.example.TiendaJhonatan.customers.infrastructure;

import com.example.TiendaJhonatan.customers.application.CustomerService;
import com.example.TiendaJhonatan.customers.domain.Customer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(customerService.searchByName(search));
        }
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(customerService.findActive());
        }
        return ResponseEntity.ok(customerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.create(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable UUID id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.update(id, customer));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, String>> deactivate(@PathVariable UUID id) {
        customerService.deactivate(id);
        return ResponseEntity.ok(Map.of("message", "Cliente desactivado"));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Customer> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.activate(id));
    }
}