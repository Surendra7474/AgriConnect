package com.agriconnect.dto.response;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Integer rating,
        String comment,
        String reviewerName,
        Long reviewerId,
        Instant createdAt
) {
}
