package com.agriconnect.service;

import com.agriconnect.constant.NotificationType;
import com.agriconnect.dto.response.NotificationResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    PageResponse<NotificationResponse> listMine(Pageable pageable);

    NotificationResponse markRead(Long notificationId);

    void markAllRead();

    void createSystemNotification(User user, String title, String message, NotificationType type, String relatedEntityType, String relatedEntityId);
}
