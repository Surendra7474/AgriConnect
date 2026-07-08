package com.agriconnect.service;

import com.agriconnect.dto.request.ForgotPasswordRequest;
import com.agriconnect.dto.request.LoginRequest;
import com.agriconnect.dto.request.RefreshTokenRequest;
import com.agriconnect.dto.request.RegisterRequest;
import com.agriconnect.dto.request.ResetPasswordRequest;
import com.agriconnect.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
