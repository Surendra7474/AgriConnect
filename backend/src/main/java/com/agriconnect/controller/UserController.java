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
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

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
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone().trim());
        }
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            user.setPreferredLanguage(request.preferredLanguage().trim().toLowerCase());
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ResponseFactory.success("user.profile.updated", userMapper.toSummary(saved)));
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
