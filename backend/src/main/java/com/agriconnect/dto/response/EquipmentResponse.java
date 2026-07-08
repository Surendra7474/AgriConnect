package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record EquipmentResponse(
        Long id,
        UserSummaryResponse owner,
        String name,
        String category,
        String description,
        BigDecimal rentalPricePerDay,
        BigDecimal securityDeposit,
        String location,
        String brand,
        String model,
        String yearOfManufacture,
        Boolean available,
        String approvalStatus,
        Double averageRating,
        List<String> imageUrls,
        Instant createdAt,
        Instant updatedAt
) {
}
