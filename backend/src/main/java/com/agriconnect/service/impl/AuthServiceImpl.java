package com.agriconnect.service.impl;

import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.ForgotPasswordRequest;
import com.agriconnect.dto.request.LoginRequest;
import com.agriconnect.dto.request.RefreshTokenRequest;
import com.agriconnect.dto.request.RegisterRequest;
import com.agriconnect.dto.request.ResetPasswordRequest;
import com.agriconnect.dto.response.AuthResponse;
import com.agriconnect.entity.RefreshToken;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.jwt.JwtService;
import com.agriconnect.repository.RefreshTokenRepository;
import com.agriconnect.repository.RoleRepository;
import com.agriconnect.repository.UserRepository;
import com.agriconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("auth.email.already.registered");
        }

        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new ResourceNotFoundException("auth.role.not.found", request.role().name()));

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(role);
        user.setVerified(Boolean.TRUE);
        user.setActive(Boolean.TRUE);
        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("auth.credentials.invalid"));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BadRequestException("auth.account.inactive");
        }
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("auth.refresh.token.invalid"));
        if (refreshToken.getRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("auth.refresh.token.expired");
        }
        User user = refreshToken.getUser();
        return buildAuthResponse(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found", request.email()));
        user.setResetPasswordToken(UUID.randomUUID().toString());
        user.setResetPasswordTokenExpiry(Instant.now().plusSeconds(3600));
        userRepository.save(user);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findAll().stream()
                .filter(existing -> request.token().equals(existing.getResetPasswordToken()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("auth.reset.token.invalid"));
        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("auth.reset.token.expired");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        refreshTokenRepository.findAllByUserAndRevokedFalse(user)
                .forEach(token -> token.setRevoked(Boolean.TRUE));
        refreshTokenRepository.save(newRefreshToken(user, refreshTokenValue));

        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                "Bearer",
                jwtService.getAccessTokenValidityMillis(),
                jwtService.getRefreshTokenValidityMillis(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name(),
                List.of("READ", "WRITE")
        );
    }

    private RefreshToken newRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenValidityMillis()));
        refreshToken.setRevoked(Boolean.FALSE);
        return refreshToken;
    }
}
