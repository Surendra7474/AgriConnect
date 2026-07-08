package com.agriconnect.dto.request;

import com.agriconnect.constant.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FeedbackRequest(
        @NotNull
        FeedbackType type,

        @NotBlank
        @Size(max = 200)
        String subject,

        @NotBlank
        @Size(max = 3000)
        String message
) {
}
