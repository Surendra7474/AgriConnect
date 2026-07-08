package com.agriconnect.dto.request;

import com.agriconnect.constant.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingStatusUpdateRequest(
        @NotNull
        BookingStatus status,

        @Size(max = 1000)
        String notes
) {
}
