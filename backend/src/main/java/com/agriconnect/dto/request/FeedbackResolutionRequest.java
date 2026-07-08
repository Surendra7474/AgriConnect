package com.agriconnect.dto.request;

import com.agriconnect.constant.FeedbackStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FeedbackResolutionRequest(
        @NotNull
        FeedbackStatus status,

        @Size(max = 3000)
        String adminResolution
) {
}
