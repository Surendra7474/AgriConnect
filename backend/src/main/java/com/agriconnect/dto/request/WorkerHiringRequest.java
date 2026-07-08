package com.agriconnect.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record WorkerHiringRequest(
        @NotNull
        Long workerProfileId,

        @NotNull
        @FutureOrPresent
        LocalDate startDate,

        @NotNull
        @FutureOrPresent
        LocalDate endDate,

        @Size(max = 1000)
        String notes
) {
}
