package com.agriconnect.dto.request;

import com.agriconnect.constant.ProductStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductStatusUpdateRequest(
        @NotNull
        ProductStatus status,

        @Size(max = 1000)
        String reason
) {
}
