package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

import static com.example.backend.constants.ErrorMessage.FILL_IN_THE_INPUT_FIELD;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookDTO {
    private Long id;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String title;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String author;

    private String publisher;
    private String category;

    @NotBlank(message = FILL_IN_THE_INPUT_FIELD)
    private String description;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal originalPrice;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal discountPrice;

    @NotNull(message = FILL_IN_THE_INPUT_FIELD)
    @Min(0)
    private Integer stock;

    @Min(0)
    private Integer sold;

    private Integer yearPublished;
    private Float rating;
    private Boolean isDeleted;
    private List<String> coverImages;

    @JsonIgnore
    private List<MultipartFile> files;
}
