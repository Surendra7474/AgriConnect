package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record WorkerHiringResponse(
        Long id,
        Long workerProfileId,
        UserSummaryResponse worker,
        UserSummaryResponse farmer,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalAmount,
        String status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
