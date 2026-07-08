package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record WorkerProfileResponse(
        Long id,
        UserSummaryResponse user,
        String skills,
        String location,
        BigDecimal dailyRate,
        String bio,
        String phoneNumber,
        Boolean available,
        String approvalStatus,
        Double averageRating,
        Instant createdAt,
        Instant updatedAt
) {
}
