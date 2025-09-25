package com.example.backend.controller;

import com.example.backend.dto.CartDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.entity.Cart;
import com.example.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseDTO<CartDTO> getCart(@RequestParam Long userId) {
        return ResponseDTO.<CartDTO>builder()
                .data(cartService.getCart(userId))
                .status(200)
                .message("Lấy giỏ hàng thành công")
                .build();
    }

    @PostMapping("/add")
    public ResponseDTO<CartDTO> addBook(@RequestParam Long userId,
                                        @RequestParam Long bookId,
                                        @RequestParam int quantity) {
        return ResponseDTO.<CartDTO>builder()
                .data(cartService.addBook(userId, bookId, quantity))
                .status(200)
                .message("Thêm sách vào giỏ hàng thành công")
                .build();
    }

    @PutMapping("/update")
    public ResponseDTO<CartDTO> updateBookQuantity(@RequestParam Long userId,
                                                   @RequestParam Long bookId,
                                                   @RequestParam int newQuantity) {
        return ResponseDTO.<CartDTO>builder()
                .data(cartService.updateBookQuantity(userId, bookId, newQuantity))
                .status(200)
                .message("Cập nhật số lượng thành công")
                .build();
    }

    @DeleteMapping("/remove")
    public ResponseDTO<CartDTO> removeBook(@RequestParam Long userId,
                                           @RequestParam Long bookId) {
        return ResponseDTO.<CartDTO>builder()
                .data(cartService.removeBook(userId, bookId))
                .status(200)
                .message("Xóa sách khỏi giỏ hàng thành công")
                .build();
    }
}

