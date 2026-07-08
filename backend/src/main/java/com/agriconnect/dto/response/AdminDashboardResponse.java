package com.agriconnect.dto.response;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long pendingEquipment,
        long approvedEquipment,
        long pendingWorkers,
        long approvedWorkers,
        long openFeedback,
        long pendingBookings,
        long pendingHirings,
        long pendingProducts,
        long approvedProducts,
        long pendingOrders,
        long totalOrders,
        java.math.BigDecimal totalGmv
) {
}
