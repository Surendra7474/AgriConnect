package com.agriconnect.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 150) String fullName,
        @Pattern(regexp = "^[0-9+() -]{7,20}$", message = "Phone number format is invalid") String phone,
        @Size(min = 2, max = 10) String preferredLanguage
) {
}
