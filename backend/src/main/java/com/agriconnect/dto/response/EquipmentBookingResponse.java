package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record EquipmentBookingResponse(
        Long id,
        Long equipmentId,
        String equipmentName,
        UserSummaryResponse farmer,
        UserSummaryResponse owner,
        LocalDate bookingDate,
        LocalDate returnDate,
        BigDecimal totalAmount,
        String status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
