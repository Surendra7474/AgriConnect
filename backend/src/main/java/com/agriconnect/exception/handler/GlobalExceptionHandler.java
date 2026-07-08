package com.agriconnect.exception.handler;

import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.GlobalException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<GlobalException> handleNotFound(ResourceNotFoundException exception, WebRequest request) {
        String message = resolve(exception.getMessageKey(), exception.getArgs(), exception.getMessage());
        return build(HttpStatus.NOT_FOUND, message, request, null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<GlobalException> handleBadRequest(BadRequestException exception, WebRequest request) {
        String message = resolve(exception.getMessageKey(), exception.getArgs(), exception.getMessage());
        return build(HttpStatus.BAD_REQUEST, message, request, null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<GlobalException> handleUnauthorized(UnauthorizedException exception, WebRequest request) {
        String message = resolve(exception.getMessageKey(), exception.getArgs(), exception.getMessage());
        return build(HttpStatus.UNAUTHORIZED, message, request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GlobalException> handleAccessDenied(AccessDeniedException exception, WebRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("common.access.denied", null, "Access denied", locale);
        return build(HttpStatus.FORBIDDEN, message, request, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<GlobalException> handleAuthentication(AuthenticationException exception, WebRequest request) {
        return build(HttpStatus.UNAUTHORIZED, exception.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GlobalException> handleValidation(MethodArgumentNotValidException exception, WebRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        Map<String, String> errors = new LinkedHashMap<>();
        BindingResult bindingResult = exception.getBindingResult();
        bindingResult.getFieldErrors().forEach(error -> {
            String message = error.getDefaultMessage();
            if (message != null && !message.contains(" ")) {
                try {
                    message = messageSource.getMessage(message, null, message, locale);
                } catch (org.springframework.context.NoSuchMessageException ignored) {
                    // keep original message
                }
            }
            errors.put(error.getField(), message);
        });
        String validationMessage = messageSource.getMessage("common.validation.failed", null, "Validation failed", locale);
        return build(HttpStatus.UNPROCESSABLE_ENTITY, validationMessage, request, errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalException> handleGeneric(Exception exception, WebRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageSource.getMessage("common.error", null, "Unexpected server error", locale);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, message, request, null);
    }

    private String resolve(String messageKey, Object[] args, String fallback) {
        if (messageKey == null) {
            return fallback;
        }
        try {
            Locale locale = LocaleContextHolder.getLocale();
            return messageSource.getMessage(messageKey, args, fallback, locale);
        } catch (Exception e) {
            return fallback;
        }
    }

    private ResponseEntity<GlobalException> build(HttpStatus status, String message, WebRequest request, Map<String, String> validationErrors) {
        String path = request instanceof ServletWebRequest servletWebRequest ? servletWebRequest.getRequest().getRequestURI() : "";
        return ResponseEntity.status(status).body(GlobalException.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .validationErrors(validationErrors)
                .build());
    }
}
