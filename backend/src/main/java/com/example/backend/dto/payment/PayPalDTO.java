package com.example.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayPalDTO {
    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private BigDecimal amount;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String currency;
    private String description = "Thanh toán với PayPal";
}
