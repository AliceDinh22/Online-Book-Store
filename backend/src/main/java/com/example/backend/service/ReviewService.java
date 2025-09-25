package com.example.backend.service;

import com.example.backend.dto.ReviewDTO;
import com.example.backend.entity.Review;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO> getReviewsByBookId(Long bookId);

    ReviewDTO addReviewToBook(ReviewDTO reviewDTO, Long bookId);
}
