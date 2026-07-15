package com.agriconnect.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EquipmentBookingRequest(
        @NotNull
        Long equipmentId,

        @NotNull
        @FutureOrPresent
        LocalDate bookingDate,

        @NotNull
        @FutureOrPresent
        LocalDate returnDate,

        @NotBlank(message = "Payment proof image is required")
        @Size(max = 500, message = "Payment proof URL must be under 500 characters")
        String paymentProofUrl,

        @Size(max = 1000)
        String notes
) {
}
