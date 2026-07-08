package com.agriconnect.repository;

import com.agriconnect.constant.NotificationStatus;
import com.agriconnect.entity.Notification;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserAndStatus(User user, NotificationStatus status);

    List<Notification> findByUser(User user);

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
