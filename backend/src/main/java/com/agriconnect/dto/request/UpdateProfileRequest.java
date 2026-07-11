package com.agriconnect.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 150) String fullName,
        @jakarta.validation.constraints.Email(regexp = "^$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Invalid email format")
        @Size(max = 255) String email,
        @Pattern(regexp = "^[0-9+() -]{7,20}$", message = "Phone number format is invalid") String phone,
        @Size(min = 2, max = 10) String preferredLanguage
) {
}
