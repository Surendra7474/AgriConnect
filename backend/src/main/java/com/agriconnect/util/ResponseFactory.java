package com.agriconnect.util;

import com.agriconnect.dto.response.ApiResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Locale;

@Component
public class ResponseFactory {

    private static MessageSource messageSource;

    public ResponseFactory(MessageSource messageSource) {
        ResponseFactory.messageSource = messageSource;
    }

    public static <T> ApiResponse<T> success(String messageKey, T data) {
        Locale locale = LocaleContextHolder.getLocale();
        String message = resolveMessage(messageKey, locale);
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> successRaw(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    private static String resolveMessage(String key, Locale locale) {
        try {
            return messageSource.getMessage(key, null, key, locale);
        } catch (Exception e) {
            return key;
        }
    }
}
