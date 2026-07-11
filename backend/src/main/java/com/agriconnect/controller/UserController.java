package com.agriconnect.controller;

import com.agriconnect.dto.request.ChangePasswordRequest;
import com.agriconnect.dto.request.UpdateProfileRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.mapper.UserMapper;
import com.agriconnect.repository.UserRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+() -]{7,20}$");

    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getProfile() {
        User user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ResponseFactory.success("user.profile.fetched", userMapper.toSummary(user)));
    }

@PutMapping("/me")
public ResponseEntity<ApiResponse<UserSummaryResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
    User user = currentUserProvider.getCurrentUser();
    try {
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            String newEmail = request.email().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                    throw new BadRequestException("auth.email.already.registered");
                }
                user.setEmail(newEmail);
            }
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            String phone = request.phone().trim();
            if (!PHONE_PATTERN.matcher(phone).matches()) {
                throw new BadRequestException("Phone number format is invalid. Use digits, +, -, (, ) or spaces (7-20 characters).");
            }
            user.setPhone(phone);
        }
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            user.setPreferredLanguage(request.preferredLanguage().trim().toLowerCase());
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ResponseFactory.success("user.profile.updated", userMapper.toSummary(saved)));
    } catch (DataIntegrityViolationException e) {
        log.error("Phone number likely duplicate for user {}: {}", user.getId(), request.phone(), e);
        throw new BadRequestException("Phone number is already in use by another account.");
    } catch (BadRequestException e) {
        throw e;
    } catch (Exception e) {
        log.error("Unexpected error updating profile for user {}: {}", user.getId(), e.getMessage(), e);
        throw new BadRequestException("Failed to update profile: " + e.getMessage());
    }
}

    @PutMapping("/me/language")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateLanguage(@Valid @RequestBody Map<String, String> request) {
        User user = currentUserProvider.getCurrentUser();
        String language = request.get("preferredLanguage");
        if (language == null || language.isBlank()) {
            throw new BadRequestException("preferredLanguage is required");
        }
        String trimmed = language.trim().toLowerCase();
        if (!java.util.List.of("en", "hi", "te").contains(trimmed)) {
            throw new BadRequestException("Unsupported language. Supported: en, hi, te");
        }
        user.setPreferredLanguage(trimmed);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ResponseFactory.success("user.language.updated", userMapper.toSummary(saved)));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserProvider.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ResponseFactory.success("user.password.changed", null));
    }
}
