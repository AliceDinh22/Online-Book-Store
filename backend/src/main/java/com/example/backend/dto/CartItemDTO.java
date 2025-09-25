package com.example.backend.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private BookDTO book;
    private Integer quantity;
}
