package com.example.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDTO {
    private Long id;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @Min(value = 1, message = "Rating tối thiểu là 1")
    @Max(value = 5, message = "Rating tối đa là 5")
    private Integer rating;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private String message;
    private LocalDateTime date;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private Long bookId;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    private Long userId;

    private String firstName;
    private String lastName;
}
