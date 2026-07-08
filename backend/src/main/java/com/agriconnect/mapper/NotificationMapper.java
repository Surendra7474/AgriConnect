package com.agriconnect.mapper;

import com.agriconnect.dto.response.NotificationResponse;
import com.agriconnect.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType().name(),
                notification.getStatus().name(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.getCreatedAt()
        );
    }
}
