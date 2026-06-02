package com.example.TiendaJhonatan.sales.application;

import com.example.TiendaJhonatan.sales.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CreditNoteService {

    private final CreditNoteRepository creditNoteRepository;
    private final PaymentRepository paymentRepository;

    public CreditNoteService(CreditNoteRepository creditNoteRepository,
                             PaymentRepository paymentRepository) {
        this.creditNoteRepository = creditNoteRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public CreditNote create(Map<String, Object> request) {
        UUID customerId = UUID.fromString((String) request.get("customerId"));
        UUID sellerId = UUID.fromString((String) request.get("sellerId"));
        BigDecimal totalAmount = new BigDecimal(request.get("totalAmount").toString());
        String description = (String) request.getOrDefault("description", "");

        CreditNote creditNote = CreditNote.builder()
                .customerId(customerId)
                .sellerId(sellerId)
                .totalAmount(totalAmount)
                .pendingBalance(totalAmount)
                .status("PENDING")
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return creditNoteRepository.save(creditNote);
    }

    public List<CreditNote> findAll() {
        return creditNoteRepository.findAll();
    }

    public List<CreditNote> findPending() {
        return creditNoteRepository.findPendingDebts();
    }

    public CreditNote findById(UUID id) {
        return creditNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiado no encontrado"));
    }

    public List<CreditNote> findByCustomer(UUID customerId) {
        return creditNoteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public Payment addPayment(UUID creditNoteId, Map<String, Object> request) {
        CreditNote creditNote = findById(creditNoteId);

        if (creditNote.getStatus().equals("PAID")) {
            throw new RuntimeException("Este fiado ya esta pagado completamente");
        }

        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String method = (String) request.getOrDefault("paymentMethod", "EFECTIVO");

        if (amount.compareTo(creditNote.getPendingBalance()) > 0) {
            throw new RuntimeException("El monto excede el saldo pendiente");
        }

        Payment payment = Payment.builder()
                .creditNoteId(creditNoteId)
                .amount(amount)
                .paymentDate(LocalDateTime.now())
                .paymentMethod(method)
                .build();

        paymentRepository.save(payment);

        BigDecimal newBalance = creditNote.getPendingBalance().subtract(amount);
        creditNote.setPendingBalance(newBalance);
        creditNote.setUpdatedAt(LocalDateTime.now());

        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            creditNote.setStatus("PAID");
        } else {
            creditNote.setStatus("PARTIALLY_PAID");
        }

        creditNoteRepository.save(creditNote);

        return payment;
    }

    public List<Payment> getPayments(UUID creditNoteId) {
        return paymentRepository.findByCreditNoteIdOrderByPaymentDateDesc(creditNoteId);
    }

    public Map<String, Object> getDailyReport() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        BigDecimal totalFiado = creditNoteRepository.getTotalFiadoToday(startOfDay, endOfDay);
        BigDecimal totalRecuperado = paymentRepository.getTotalRecoveredToday(startOfDay, endOfDay);

        Map<String, Object> report = new HashMap<>();
        report.put("totalFiadoHoy", totalFiado);
        report.put("totalRecuperadoHoy", totalRecuperado);
        report.put("totalPendiente", creditNoteRepository.getTotalPendingDebt());

        return report;
    }
}