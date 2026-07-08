package com.agriconnect.repository;

import com.agriconnect.constant.FeedbackStatus;
import com.agriconnect.entity.Feedback;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByStatus(FeedbackStatus status);

    Page<Feedback> findByStatus(FeedbackStatus status, Pageable pageable);

    Page<Feedback> findBySubmittedBy(User submittedBy, Pageable pageable);

    long countByStatus(FeedbackStatus status);
}
