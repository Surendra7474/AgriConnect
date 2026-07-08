package com.agriconnect.dto.request;

import com.agriconnect.constant.EquipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EquipmentStatusUpdateRequest(
        @NotNull
        EquipmentStatus status,

        @Size(max = 1000)
        String reason
) {
}
