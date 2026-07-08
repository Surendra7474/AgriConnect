package com.agriconnect.jwt;

import com.agriconnect.config.JwtProperties;
import com.agriconnect.entity.RefreshToken;
import com.agriconnect.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    public String generateAccessToken(User user) {
        return generateToken(new HashMap<>(), user.getEmail(), jwtProperties.accessTokenExpirationMinutes(), ChronoUnit.MINUTES);
    }

    public String generateRefreshToken(User user) {
        return generateToken(new HashMap<>(), user.getEmail(), jwtProperties.refreshTokenExpirationDays(), ChronoUnit.DAYS);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, User user) {
        String username = extractUsername(token);
        return username.equalsIgnoreCase(user.getEmail()) && !isTokenExpired(token);
    }

    public long getAccessTokenValidityMillis() {
        return ChronoUnit.MINUTES.getDuration().toMillis() * jwtProperties.accessTokenExpirationMinutes();
    }

    public long getRefreshTokenValidityMillis() {
        return ChronoUnit.DAYS.getDuration().toMillis() * jwtProperties.refreshTokenExpirationDays();
    }

    private String generateToken(Map<String, Object> extraClaims, String subject, long amount, ChronoUnit unit) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(amount, unit);
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
            .signWith(getSigningKey())
                .compact();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }
}
