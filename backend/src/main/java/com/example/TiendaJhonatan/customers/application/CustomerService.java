package com.example.TiendaJhonatan.customers.application;

import com.example.TiendaJhonatan.customers.domain.Customer;
import com.example.TiendaJhonatan.customers.domain.CustomerRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public List<Customer> findActive() {
        return customerRepository.findByStatus("ACTIVE");
    }

    public Customer findById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public List<Customer> searchByName(String name) {
        return customerRepository.findByFullNameContainingIgnoreCase(name);
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        customer.setRegistrationDate(LocalDateTime.now());
        customer.setStatus("ACTIVE");
        return customerRepository.save(customer);
    }

    public Customer update(UUID id, Customer updatedCustomer) {
        Customer existing = findById(id);
        existing.setFullName(updatedCustomer.getFullName());
        existing.setDocument(updatedCustomer.getDocument());
        existing.setPhone(updatedCustomer.getPhone());
        existing.setAddress(updatedCustomer.getAddress());
        return customerRepository.save(existing);
    }

    public void deactivate(UUID id) {
        Customer customer = findById(id);
        customer.setStatus("INACTIVE");
        customerRepository.save(customer);
    }

    public Customer activate(UUID id) {
        Customer customer = findById(id);
        customer.setStatus("ACTIVE");
        return customerRepository.save(customer);
    }
}