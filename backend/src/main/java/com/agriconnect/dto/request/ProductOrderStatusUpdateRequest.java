package com.agriconnect.dto.request;

import com.agriconnect.constant.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductOrderStatusUpdateRequest(
        @NotNull
        OrderStatus status,

        @Size(max = 1000)
        String notes
) {
}
