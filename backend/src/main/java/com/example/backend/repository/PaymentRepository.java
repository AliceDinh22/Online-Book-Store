package com.example.backend.repository;

import com.example.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String paymentId);

    Optional<Payment> findByOrderId(Long id);
}
