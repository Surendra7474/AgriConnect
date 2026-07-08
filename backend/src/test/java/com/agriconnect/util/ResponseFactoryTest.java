package com.agriconnect.util;

import com.agriconnect.dto.response.ApiResponse;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResponseFactoryTest {

    @Test
    void successShouldBuildSuccessfulResponseWithPayloadAndTimestamp() {
        Instant before = Instant.now();

        ApiResponse<String> response = ResponseFactory.success("Saved successfully", "payload");

        assertTrue(response.success());
        assertEquals("Saved successfully", response.message());
        assertEquals("payload", response.data());
        assertNotNull(response.timestamp());
        assertTrue(!response.timestamp().isBefore(before));
    }
}
