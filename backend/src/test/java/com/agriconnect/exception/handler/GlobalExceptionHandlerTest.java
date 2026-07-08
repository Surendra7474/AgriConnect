package com.agriconnect.exception.handler;

import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.GlobalException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.core.MethodParameter;

import java.lang.reflect.Method;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private MessageSource messageSource;

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler(messageSource);
    }

    @Test
    void handleNotFoundShouldReturn404Response() {
        WebRequest request = request("/api/test/not-found");

        var response = handler.handleNotFound(new ResourceNotFoundException("Missing resource"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Missing resource", response.getBody().message());
        assertEquals("/api/test/not-found", response.getBody().path());
    }

    @Test
    void handleBadRequestShouldReturn400Response() {
        WebRequest request = request("/api/test/bad-request");

        var response = handler.handleBadRequest(new BadRequestException("Bad request"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad request", response.getBody().message());
    }

    @Test
    void handleUnauthorizedShouldReturn401Response() {
        WebRequest request = request("/api/test/unauthorized");

        var response = handler.handleUnauthorized(new UnauthorizedException("Unauthorized"), request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Unauthorized", response.getBody().message());
    }

    @Test
    void handleValidationShouldReturn422WithFieldErrors() throws Exception {
        WebRequest request = request("/api/test/validation");
        MethodParameter methodParameter = methodParameter();
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "payload");
        bindingResult.addError(new FieldError("payload", "email", "must not be blank"));
        bindingResult.addError(new FieldError("payload", "password", "too short"));
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(methodParameter, bindingResult);

        when(messageSource.getMessage(eq("common.validation.failed"), any(), any(), any(Locale.class)))
                .thenReturn("Validation failed");

        var response = handler.handleValidation(exception, request);

        assertEquals(422, response.getStatusCode().value());
        GlobalException body = response.getBody();
        assertEquals("Validation failed", body.message());
        assertEquals("/api/test/validation", body.path());
        assertEquals(Map.of("email", "must not be blank", "password", "too short"), body.validationErrors());
    }

    @Test
    void handleGenericShouldReturn500Response() {
        WebRequest request = request("/api/test/generic");

        when(messageSource.getMessage(eq("common.error"), any(), any(), any(Locale.class)))
                .thenReturn("Unexpected server error");

        var response = handler.handleGeneric(new IllegalStateException("boom"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Unexpected server error", response.getBody().message());
        assertNotNull(response.getBody().timestamp());
    }

    // --- i18n tests ---

    @Test
    void handleNotFoundShouldReturnHindiMessageWhenAcceptLanguageIsHindi() {
        WebRequest request = requestWithLanguage("/api/products/999", "hi");

        when(messageSource.getMessage(eq("product.not.found"), any(), any(), eq(Locale.of("hi"))))
                .thenReturn("उत्पाद नहीं मिला: 999");

        ResourceNotFoundException ex = new ResourceNotFoundException("product.not.found", 999);
        var response = handler.handleNotFound(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("उत्पाद नहीं मिला: 999", response.getBody().message());
    }

    @Test
    void handleNotFoundShouldReturnEnglishMessageWhenAcceptLanguageIsEnglish() {
        WebRequest request = requestWithLanguage("/api/products/999", "en");

        when(messageSource.getMessage(eq("product.not.found"), any(), any(), eq(Locale.ENGLISH)))
                .thenReturn("Product not found: 999");

        ResourceNotFoundException ex = new ResourceNotFoundException("product.not.found", 999);
        var response = handler.handleNotFound(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Product not found: 999", response.getBody().message());
    }

    @Test
    void handleBadRequestShouldReturnTranslatedMessageForKeyedException() {
        WebRequest request = requestWithLanguage("/api/orders", "hi");

        when(messageSource.getMessage(eq("order.buyer.cancel.only"), any(), any(), eq(Locale.of("hi"))))
                .thenReturn("खरीदार केवल लंबित ऑर्डर रद्द कर सकते हैं");

        BadRequestException ex = new BadRequestException("order.buyer.cancel.only");
        var response = handler.handleBadRequest(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("खरीदार केवल लंबित ऑर्डर रद्द कर सकते हैं", response.getBody().message());
    }

    @Test
    void handleExceptionShouldFallbackToRawMessageWhenNoKeySet() {
        WebRequest request = request("/api/test/fallback");

        var response = handler.handleNotFound(new ResourceNotFoundException("Raw fallback message"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Raw fallback message", response.getBody().message());
    }

    // --- helpers ---

    private static WebRequest request(String path) {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRequestURI(path);
        return new ServletWebRequest(servletRequest);
    }

    private static WebRequest requestWithLanguage(String path, String language) {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRequestURI(path);
        servletRequest.addHeader("Accept-Language", language);
        return new ServletWebRequest(servletRequest);
    }

    private static MethodParameter methodParameter() throws NoSuchMethodException {
        Method method = DummyController.class.getDeclaredMethod("submit", String.class);
        return new MethodParameter(method, 0);
    }

    private static final class DummyController {
        @SuppressWarnings("unused")
        public void submit(String value) {
        }
    }
}
