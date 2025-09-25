package com.example.backend.dto.payment.sepay;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SePayDTO {
    private BigDecimal amount;
    private String currency;
    private String description;
}
