package com.agriconnect.dto.request;

import com.agriconnect.constant.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String fullName,
        @Email @NotBlank @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Pattern(regexp = "^[0-9+() -]{7,20}$", message = "Phone number format is invalid") String phone,
        @NotNull RoleName role
) {
}
