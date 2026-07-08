package com.agriconnect.dto.request;

import com.agriconnect.constant.WorkerApprovalStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkerApprovalStatusUpdateRequest(
        @NotNull
        WorkerApprovalStatus status,

        @Size(max = 1000)
        String reason
) {
}
