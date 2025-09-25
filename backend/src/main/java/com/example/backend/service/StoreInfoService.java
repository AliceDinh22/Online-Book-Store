package com.example.backend.service;

import com.example.backend.entity.StoreInfo;

import java.util.List;

public interface StoreInfoService {
    StoreInfo createStoreInfo(StoreInfo storeInfo);

    List<StoreInfo> getAllStoreInfo();

    StoreInfo getLatestStoreInfo();
}
