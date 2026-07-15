package com.agriconnect.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductOrderRequest(
        @NotNull
        Long productId,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal quantity,

        @NotBlank
        @Size(max = 2000)
        String deliveryAddress,

        @NotBlank
        @Size(max = 500)
        String paymentProofUrl,

        @Size(max = 1000)
        String notes
) {
}
