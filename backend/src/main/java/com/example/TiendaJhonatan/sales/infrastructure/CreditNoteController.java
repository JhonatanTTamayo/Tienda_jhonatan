package com.example.TiendaJhonatan.sales.infrastructure;

import com.example.TiendaJhonatan.sales.application.CreditNoteService;
import com.example.TiendaJhonatan.sales.domain.CreditNote;
import com.example.TiendaJhonatan.sales.domain.Payment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/credit-notes")
@CrossOrigin(origins = "http://localhost:5173")
public class CreditNoteController {

    private final CreditNoteService creditNoteService;

    public CreditNoteController(CreditNoteService creditNoteService) {
        this.creditNoteService = creditNoteService;
    }

    @GetMapping
    public ResponseEntity<List<CreditNote>> findAll() {
        return ResponseEntity.ok(creditNoteService.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CreditNote>> findPending() {
        return ResponseEntity.ok(creditNoteService.findPending());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditNote> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(creditNoteService.findById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CreditNote>> findByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(creditNoteService.findByCustomer(customerId));
    }

    @PostMapping
    public ResponseEntity<CreditNote> create(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(creditNoteService.create(request));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<Payment> addPayment(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(creditNoteService.addPayment(id, request));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<Payment>> getPayments(@PathVariable UUID id) {
        return ResponseEntity.ok(creditNoteService.getPayments(id));
    }

    @GetMapping("/reports/daily")
    public ResponseEntity<Map<String, Object>> getDailyReport() {
        return ResponseEntity.ok(creditNoteService.getDailyReport());
    }
}