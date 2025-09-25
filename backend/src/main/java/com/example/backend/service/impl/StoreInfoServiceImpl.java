package com.example.backend.service.impl;

import com.example.backend.entity.StoreInfo;
import com.example.backend.repository.StoreInfoRepository;
import com.example.backend.service.StoreInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreInfoServiceImpl implements StoreInfoService {
    private final StoreInfoRepository storeInfoRepository;

    @Override
    public StoreInfo createStoreInfo(StoreInfo storeInfo) {
        return storeInfoRepository.save(storeInfo);
    }

    @Override
    public List<StoreInfo> getAllStoreInfo() {
        return storeInfoRepository.findAll();
    }

    @Override
    public StoreInfo getLatestStoreInfo() {
        return storeInfoRepository.findFirstByOrderByCreatedAtDesc();
    }
}
