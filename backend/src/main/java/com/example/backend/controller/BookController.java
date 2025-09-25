package com.example.backend.controller;

import com.example.backend.dto.BookDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping("/active")
    public ResponseDTO<List<BookDTO>> getAllActiveBook() {
        return ResponseDTO.<List<BookDTO>>builder()
                .data(bookService.getAllActiveBook())
                .status(200)
                .message("Lấy tất cả sản phẩm đang hoạt động thành công!")
                .build();
    }

    @GetMapping("/{id}")
    public ResponseDTO<BookDTO> getById(@PathVariable Long id) {
        return ResponseDTO.<BookDTO>builder()
                .data(bookService.getById(id))
                .status(200)
                .message("Lấy sản phẩm theo id thành công!")
                .build();
    }
}
