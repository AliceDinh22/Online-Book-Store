package com.example.backend.controller;

import com.example.backend.dto.ResponseDTO;
import com.example.backend.dto.ReviewDTO;
import com.example.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/book/{bookId}")
    public ResponseDTO<List<ReviewDTO>> getReviewsByBookId(@PathVariable Long bookId) {
        return ResponseDTO.<List<ReviewDTO>>builder()
                .data(reviewService.getReviewsByBookId(bookId))
                .status(200)
                .message("Lấy đánh giá theo id sách thành công!")
                .build();
    }

    @PostMapping("/book/{bookId}")
    public ResponseDTO<ReviewDTO> addReviewToBook(@RequestBody @Valid ReviewDTO reviewDTO, @PathVariable Long bookId) {
        try {
            ReviewDTO createdReview = reviewService.addReviewToBook(reviewDTO, bookId);
            return ResponseDTO.<ReviewDTO>builder()
                    .data(createdReview)
                    .status(201)
                    .message("Thêm đánh giá cho sách thành công!")
                    .build();
        } catch (RuntimeException e) {
            return ResponseDTO.<ReviewDTO>builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        }
    }
}
