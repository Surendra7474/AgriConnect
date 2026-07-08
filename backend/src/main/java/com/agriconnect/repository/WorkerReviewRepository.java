package com.agriconnect.repository;

import com.agriconnect.entity.WorkerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerReviewRepository extends JpaRepository<WorkerReview, Long> {

    Page<WorkerReview> findByWorkerProfileIdOrderByCreatedAtDesc(Long workerProfileId, Pageable pageable);
}
