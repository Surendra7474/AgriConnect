package com.agriconnect.dto.response;

import java.time.Instant;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        Boolean active,
        Boolean verified,
        String profileImageUrl,
        String preferredLanguage,
        Instant createdAt
) {
}
