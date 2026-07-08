package com.agriconnect.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final String PASSWORD_PATTERN =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()\\[\\]{}|;:',.<>~`+=_\\-])[A-Za-z\\d@$!%*?&#^()\\[\\]{}|;:',.<>~`+=_\\-]{8,}$";

    @Override
    public void initialize(StrongPassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Password is required")
                    .addConstraintViolation();
            return false;
        }
        return password.matches(PASSWORD_PATTERN);
    }
}
