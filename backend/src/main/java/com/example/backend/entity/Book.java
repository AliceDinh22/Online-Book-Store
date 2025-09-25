package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    private String publisher;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal originalPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;

    private Integer stock;
    private Integer sold;
    private Integer yearPublished;
    private Float rating;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "book_cover_image",
            joinColumns = @JoinColumn(name = "book_id")
    )
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> coverImages;

    @OneToMany(mappedBy = "book")
    private List<Review> reviews;

    @OneToMany(mappedBy = "book")
    private List<OrderItem> orderItems;

    public BigDecimal getFinalPrice() {
        return (discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0)
                ? discountPrice
                : originalPrice;
    }
}
