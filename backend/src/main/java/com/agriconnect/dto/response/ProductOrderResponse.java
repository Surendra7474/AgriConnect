package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductOrderResponse(
        Long id,
        Long productId,
        String productName,
        UserSummaryResponse buyer,
        UserSummaryResponse farmer,
        BigDecimal quantity,
        BigDecimal pricePerUnitAtOrder,
        BigDecimal totalAmount,
        String deliveryAddress,
        String status,
        String paymentStatus,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
