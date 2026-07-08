package com.agriconnect.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProductRequest(
        @NotBlank
        @Size(max = 150)
        String name,

        @NotBlank
        @Size(max = 100)
        String category,

        @Size(max = 2000)
        String description,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal pricePerUnit,

        @NotBlank
        @Size(max = 20)
        String unit,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal quantityAvailable,

        @NotNull
        LocalDate harvestDate,

        @NotBlank
        @Size(max = 150)
        String location,

        Boolean organic,

        Boolean active,

        @Size(max = 8)
        List<@NotBlank @Size(max = 500) String> imageUrls
) {
}
