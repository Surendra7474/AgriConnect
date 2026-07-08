package com.agriconnect.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.AuthenticationException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class JwtAuthenticationEntryPointTest {

    private JwtAuthenticationEntryPoint entryPoint;

    @BeforeEach
    void setUp() {
        entryPoint = new JwtAuthenticationEntryPoint(new ObjectMapper());
    }

    @Test
    void commenceShouldWriteUnauthorizedJsonBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/secure/resource");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthenticationException exception = mock(AuthenticationException.class);
        String message = "Unauthorized access";
        org.mockito.Mockito.when(exception.getMessage()).thenReturn(message);

        entryPoint.commence(request, response, exception);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("application/json", response.getContentType());
        assertFalse(response.getContentAsString().isBlank());
        Map<?, ?> body = new ObjectMapper().readValue(response.getContentAsString(), Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED.value(), body.get("status"));
        assertEquals("Unauthorized", body.get("error"));
        assertEquals(message, body.get("message"));
        assertEquals("/api/secure/resource", body.get("path"));
        assertTrue(body.containsKey("timestamp"));
    }
}
