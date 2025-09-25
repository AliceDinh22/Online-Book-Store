package com.example.backend.dto;

import com.example.backend.dto.payment.PaymentDTO;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long id;

    private LocalDateTime date;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @DecimalMin(value = "0.0", inclusive = false, message = "Tổng giá phải lớn hơn 0")
    private BigDecimal totalPrice;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String status;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String address;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String city;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private Long userId;

    private List<OrderItemDTO> items;

    private List<Long> cartItemIds;

    private PaymentDTO payment;
    private String username;
}
