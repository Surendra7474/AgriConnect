package com.agriconnect.dto.response;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long openFeedback,
        long pendingOrders,
        long totalOrders,
        java.math.BigDecimal totalGmv
) {
}
