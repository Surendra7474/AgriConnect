package com.agriconnect.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
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

        @Size(max = 1000)
        String notes
) {
}
