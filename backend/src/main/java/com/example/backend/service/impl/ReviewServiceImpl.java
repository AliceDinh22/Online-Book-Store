package com.example.backend.service.impl;

import com.example.backend.dto.ReviewDTO;
import com.example.backend.entity.Book;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.BookRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Override
    public List<ReviewDTO> getReviewsByBookId(Long bookId) {
        List<Review> reviews = reviewRepository.findByBook_Id(bookId);
        return reviews.stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public ReviewDTO addReviewToBook(ReviewDTO reviewDTO, Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        if (reviewDTO.getUserId() == null) {
            throw new RuntimeException("Người dùng không hợp lệ");
        }

        if (reviewDTO.getBookId() != null && !reviewDTO.getBookId().equals(bookId)) {
            throw new RuntimeException("bookId không khớp giữa path và body");
        }


        User user = userRepository.findById(reviewDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Review review = new Review();
        review.setRating(reviewDTO.getRating());
        review.setMessage(reviewDTO.getMessage());
        review.setUser(user);
        review.setBook(book);
        review.setDate(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        List<Review> reviews = reviewRepository.findByBook_Id(bookId);
        float avgRating = (float) reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(savedReview.getRating());

        book.setRating(avgRating);
        bookRepository.save(book);

        return mapToDTO(savedReview);
    }

    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setMessage(review.getMessage());
        dto.setDate(review.getDate());
        dto.setBookId(review.getBook().getId());
        dto.setUserId(review.getUser().getId());
        dto.setFirstName(review.getUser().getFirstName());
        dto.setLastName(review.getUser().getLastName());
        return dto;
    }
}
