package com.agriconnect.repository;

import com.agriconnect.entity.CropPredictionHistory;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropPredictionHistoryRepository extends JpaRepository<CropPredictionHistory, Long> {

    List<CropPredictionHistory> findByRequestedBy(User requestedBy);

    Page<CropPredictionHistory> findByRequestedByOrderByCreatedAtDesc(User requestedBy, Pageable pageable);
}
