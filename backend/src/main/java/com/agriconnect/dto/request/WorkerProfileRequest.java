package com.agriconnect.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record WorkerProfileRequest(
        @NotBlank
        @Size(max = 2000)
        String skills,

        @NotBlank
        @Size(max = 150)
        String location,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal dailyRate,

        @Size(max = 2000)
        String bio,

        @Size(max = 20)
        String phoneNumber,

        Boolean available
) {
}
