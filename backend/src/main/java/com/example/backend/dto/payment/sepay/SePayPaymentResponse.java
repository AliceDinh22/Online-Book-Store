package com.example.backend.dto.payment.sepay;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SePayPaymentResponse {
    private String paymentUrl;
    private String transactionId;
}

