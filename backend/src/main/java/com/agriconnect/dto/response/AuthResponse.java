package com.agriconnect.dto.response;

import java.util.List;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn,
        Long refreshExpiresIn,
        Long userId,
        String fullName,
        String email,
        String phone,
        String preferredLanguage,
        String role,
        List<String> permissions
) {
}
