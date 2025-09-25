package com.example.backend.service;

import com.example.backend.dto.CartDTO;
import com.example.backend.dto.CartItemDTO;
import com.example.backend.entity.Cart;

import java.util.List;

public interface CartService {
    CartDTO getCart(Long userId);

    CartDTO addBook(Long userId, Long bookId, int quantity);

    CartDTO removeBook(Long userId, Long bookId);

    Cart createCartForUser(Long userId);

    CartDTO updateBookQuantity(Long userId, Long bookId, int newQuantity);

    CartDTO mergeCart(Long userId, List<CartItemDTO> guestItems);
}
