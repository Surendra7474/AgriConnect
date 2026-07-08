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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                roleRepository,
                refreshTokenRepository,
                authenticationManager,
                passwordEncoder,
                jwtService
        );
    }

    @Test
    void registerShouldCreateUserAndReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest(
                "Farmer One",
                "FARMER@example.com",
                "password123",
                "+1 555 0100",
                RoleName.FARMER
        );
        Role role = role(RoleName.FARMER);
        User savedUser = user(42L, "Farmer One", "farmer@example.com", role, Boolean.TRUE);

        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(roleRepository.findByName(request.role())).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(refreshTokenRepository.findAllByUserAndRevokedFalse(savedUser)).thenReturn(List.of());
        when(jwtService.generateAccessToken(savedUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(savedUser)).thenReturn("refresh-token");
        when(jwtService.getAccessTokenValidityMillis()).thenReturn(900000L);
        when(jwtService.getRefreshTokenValidityMillis()).thenReturn(604800000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertEquals("farmer@example.com", capturedUser.getEmail());
        assertEquals("encoded-password", capturedUser.getPassword());
        assertEquals(Boolean.TRUE, capturedUser.getVerified());
        assertEquals(Boolean.TRUE, capturedUser.getActive());
        assertEquals(role, capturedUser.getRole());

        assertEquals("access-token", response.accessToken());
        assertEquals("refresh-token", response.refreshToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(900000L, response.expiresIn());
        assertEquals(604800000L, response.refreshExpiresIn());
        assertEquals(42L, response.userId());
        assertEquals("Farmer One", response.fullName());
        assertEquals("farmer@example.com", response.email());
        assertEquals("FARMER", response.role());
        assertEquals(List.of("READ", "WRITE"), response.permissions());
    }

    @Test
    void registerShouldRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "Farmer One",
                "farmer@example.com",
                "password123",
                "+1 555 0100",
                RoleName.FARMER
        );

        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));

        assertEquals("Email is already registered", exception.getMessage());
    }

    @Test
    void loginShouldAuthenticateAndReturnAuthResponseForActiveUser() {
        LoginRequest request = new LoginRequest("farmer@example.com", "password123");
        Role role = role(RoleName.FARMER);
        User user = user(7L, "Farmer One", "farmer@example.com", role, Boolean.TRUE);
        Authentication authentication = new UsernamePasswordAuthenticationToken(request.email(), request.password());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findAllByUserAndRevokedFalse(user)).thenReturn(List.of());
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.getAccessTokenValidityMillis()).thenReturn(900000L);
        when(jwtService.getRefreshTokenValidityMillis()).thenReturn(604800000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.login(request);

        assertEquals("access-token", response.accessToken());
        assertEquals("refresh-token", response.refreshToken());
        assertEquals(7L, response.userId());
    }

    @Test
    void loginShouldRejectInactiveUser() {
        LoginRequest request = new LoginRequest("farmer@example.com", "password123");
        Role role = role(RoleName.FARMER);
        User user = user(7L, "Farmer One", "farmer@example.com", role, Boolean.FALSE);

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.of(user));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.login(request));

        assertEquals("User account is inactive", exception.getMessage());
    }

    @Test
    void refreshTokenShouldRotateTokensForActiveRefreshToken() {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token-value");
        Role role = role(RoleName.FARMER);
        User user = user(11L, "Farmer One", "farmer@example.com", role, Boolean.TRUE);
        RefreshToken existingToken = refreshToken("refresh-token-value", user, Instant.now().plusSeconds(3600), Boolean.FALSE);

        when(refreshTokenRepository.findByToken(request.refreshToken())).thenReturn(Optional.of(existingToken));
        when(refreshTokenRepository.findAllByUserAndRevokedFalse(user)).thenReturn(List.of(existingToken));
        when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");
        when(jwtService.getAccessTokenValidityMillis()).thenReturn(900000L);
        when(jwtService.getRefreshTokenValidityMillis()).thenReturn(604800000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.refreshToken(request);

        assertEquals("new-access-token", response.accessToken());
        assertEquals("new-refresh-token", response.refreshToken());
        assertTrue(existingToken.getRevoked());
    }

    @Test
    void forgotPasswordShouldStoreResetTokenAndExpiry() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("farmer@example.com");
        Role role = role(RoleName.FARMER);
        User user = user(12L, "Farmer One", "farmer@example.com", role, Boolean.TRUE);

        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.forgotPassword(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertNotNull(capturedUser.getResetPasswordToken());
        assertNotNull(capturedUser.getResetPasswordTokenExpiry());
        assertTrue(capturedUser.getResetPasswordTokenExpiry().isAfter(Instant.now()));
    }

    @Test
    void resetPasswordShouldUpdatePasswordAndClearResetToken() {
        ResetPasswordRequest request = new ResetPasswordRequest("reset-token", "new-password123");
        Role role = role(RoleName.FARMER);
        User user = user(13L, "Farmer One", "farmer@example.com", role, Boolean.TRUE);
        user.setResetPasswordToken(request.token());
        user.setResetPasswordTokenExpiry(Instant.now().plusSeconds(600));

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(passwordEncoder.encode(request.newPassword())).thenReturn("encoded-new-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.resetPassword(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertEquals("encoded-new-password", capturedUser.getPassword());
        assertEquals(null, capturedUser.getResetPasswordToken());
        assertEquals(null, capturedUser.getResetPasswordTokenExpiry());
    }

    @Test
    void refreshTokenShouldRejectMissingToken() {
        RefreshTokenRequest request = new RefreshTokenRequest("missing-token");

        when(refreshTokenRepository.findByToken(request.refreshToken())).thenReturn(Optional.empty());

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.refreshToken(request));

        assertEquals("Refresh token is invalid", exception.getMessage());
    }

    @Test
    void registerShouldThrowWhenRoleIsMissing() {
        RegisterRequest request = new RegisterRequest(
                "Farmer One",
                "farmer@example.com",
                "password123",
                "+1 555 0100",
                RoleName.FARMER
        );

        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(roleRepository.findByName(request.role())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> authService.register(request));

        assertEquals("Role not found: FARMER", exception.getMessage());
    }

    private static Role role(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
    }

    private static User user(Long id, String fullName, String email, Role role, Boolean active) {
        User user = new User();
        user.setId(id);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        user.setActive(active);
        user.setVerified(Boolean.TRUE);
        return user;
    }

    private static RefreshToken refreshToken(String tokenValue, User user, Instant expiresAt, Boolean revoked) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenValue);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setRevoked(revoked);
        return refreshToken;
    }
}
