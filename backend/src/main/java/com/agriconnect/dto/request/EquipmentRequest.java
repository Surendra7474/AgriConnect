package com.agriconnect.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record EquipmentRequest(
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
        BigDecimal rentalPricePerDay,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal securityDeposit,

        @NotBlank
        @Size(max = 150)
        String location,

        @Size(max = 120)
        String brand,

        @Size(max = 120)
        String model,

        @Size(max = 50)
        String yearOfManufacture,

        Boolean available,

        @Size(max = 8)
        List<@NotBlank @Size(max = 500) String> imageUrls
) {
}
