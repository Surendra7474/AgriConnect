package com.agriconnect.repository;

import com.agriconnect.entity.EquipmentReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentReviewRepository extends JpaRepository<EquipmentReview, Long> {

    Page<EquipmentReview> findByEquipmentIdOrderByCreatedAtDesc(Long equipmentId, Pageable pageable);
}
