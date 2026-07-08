package com.agriconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CropPredictionResponse(
        Long id,
        String cropName,
        BigDecimal areaHectares,
        String soilType,
        String waterSource,
        String region,
        BigDecimal investmentAmount,
        BigDecimal estimatedYield,
        BigDecimal estimatedProfit,
        BigDecimal suitabilityScore,
        String riskAnalysis,
        List<String> recommendedCrops,
        List<String> bestPractices,
        Instant createdAt
) {
}
