package com.example.TiendaJhonatan.sales.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNote, UUID> {
    List<CreditNote> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<CreditNote> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    @Query("SELECT COALESCE(SUM(cn.pendingBalance), 0) FROM CreditNote cn WHERE cn.customerId = :customerId AND cn.status <> 'PAID'")
    BigDecimal getTotalDebtByCustomer(@Param("customerId") UUID customerId);

    @Query("SELECT cn FROM CreditNote cn WHERE cn.status <> 'PAID' ORDER BY cn.createdAt DESC")
    List<CreditNote> findPendingDebts();

    @Query("SELECT COALESCE(SUM(cn.pendingBalance), 0) FROM CreditNote cn WHERE cn.status <> 'PAID'")
    BigDecimal getTotalPendingDebt();

    @Query("SELECT COALESCE(SUM(cn.totalAmount), 0) FROM CreditNote cn WHERE cn.createdAt >= :startOfDay AND cn.createdAt < :endOfDay")
    BigDecimal getTotalFiadoToday(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}