package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_info")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StoreInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String email;

    @Column(length = 50)
    @Pattern(regexp = "\\d{10,15}", message = "Số điện thoại phải từ 10 đến 15 chữ số")
    private String phone;

    private String address;

    private String city;
    private String country;

    private LocalDateTime createdAt = LocalDateTime.now();
}
