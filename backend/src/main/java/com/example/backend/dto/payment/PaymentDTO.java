package com.example.backend.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
    private Long id;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private String currency;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String method;
    private String status;
    private Long orderId;
    private String transactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
