package com.agriconnect.dto.response;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        UserSummaryResponse submittedBy,
        String type,
        String subject,
        String message,
        String status,
        String adminResolution,
        Instant createdAt,
        Instant updatedAt
) {
}
