package com.example.backend.repository;

import com.example.backend.entity.StoreInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreInfoRepository extends JpaRepository<StoreInfo, Integer> {
    StoreInfo findFirstByOrderByCreatedAtDesc();
}
