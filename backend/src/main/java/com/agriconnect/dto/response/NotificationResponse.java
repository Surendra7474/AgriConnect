package com.agriconnect.dto.response;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        String status,
        String relatedEntityType,
        String relatedEntityId,
        Instant createdAt
) {
}
