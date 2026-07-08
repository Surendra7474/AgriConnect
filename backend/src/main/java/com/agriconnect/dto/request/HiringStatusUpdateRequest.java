package com.agriconnect.dto.request;

import com.agriconnect.constant.HiringStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HiringStatusUpdateRequest(
        @NotNull
        HiringStatus status,

        @Size(max = 1000)
        String notes
) {
}
