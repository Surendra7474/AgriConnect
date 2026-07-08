package com.agriconnect.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CropPredictionRequest(
        @NotBlank
        @Size(max = 100)
        String cropName,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal areaHectares,

        @NotBlank
        @Size(max = 100)
        String soilType,

        @NotBlank
        @Size(max = 100)
        String waterSource,

        @NotBlank
        @Size(max = 100)
        String region,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal investmentAmount
) {
}
