package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProductResponse(
        Long id,
        UserSummaryResponse farmer,
        String name,
        String category,
        String description,
        BigDecimal pricePerUnit,
        String unit,
        BigDecimal quantityAvailable,
        LocalDate harvestDate,
        String location,
        Boolean organic,
        Boolean active,
        String approvalStatus,
        Double averageRating,
        List<String> imageUrls,
        String farmerPhone,
        Instant createdAt,
        Instant updatedAt
) {
}
