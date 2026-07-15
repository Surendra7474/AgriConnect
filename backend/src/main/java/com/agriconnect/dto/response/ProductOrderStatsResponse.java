package com.agriconnect.dto.response;

import java.math.BigDecimal;

public record ProductOrderStatsResponse(
    long totalOrders,
    BigDecimal totalSpent
) {}
