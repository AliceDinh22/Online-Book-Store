package com.example.backend.dto;

import com.example.backend.dto.payment.PaymentDTO;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {
    private Long id;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private Long bookId;

    private String bookTitle;
    private String bookUrl;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @Min(value = 1, message = "Số lượng phải lớn hơn 0.")
    private Integer quantity;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    private PaymentDTO paymentDTO;
}
