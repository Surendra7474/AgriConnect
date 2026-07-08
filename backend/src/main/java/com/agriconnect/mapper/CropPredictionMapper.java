package com.agriconnect.mapper;

import com.agriconnect.dto.response.CropPredictionResponse;
import com.agriconnect.entity.CropPredictionHistory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CropPredictionMapper {

    public CropPredictionResponse toResponse(CropPredictionHistory history) {
        return new CropPredictionResponse(
                history.getId(),
                history.getCropName(),
                history.getAreaHectares(),
                history.getSoilType(),
                history.getWaterSource(),
                history.getRegion(),
                history.getInvestmentAmount(),
                history.getEstimatedYield(),
                history.getEstimatedProfit(),
                history.getSuitabilityScore(),
                history.getRiskAnalysis(),
                split(history.getRecommendedCrops()),
                split(history.getBestPractices()),
                history.getCreatedAt()
        );
    }

    private List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split("\\|"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}
