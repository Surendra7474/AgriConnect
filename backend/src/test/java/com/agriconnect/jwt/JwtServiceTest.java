package com.agriconnect.jwt;

import com.agriconnect.config.JwtProperties;
import com.agriconnect.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new JwtProperties(
                "01234567890123456789012345678901",
                15,
                7
        ));
    }

    @Test
    void generateAccessTokenShouldEmbedSubjectAndBeReadable() {
        User user = userWithEmail("farmer@example.com");

        String token = jwtService.generateAccessToken(user);

        assertEquals("farmer@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void generateRefreshTokenShouldBeValidForSameUserAndInvalidForDifferentUser() {
        User user = userWithEmail("worker@example.com");
        User otherUser = userWithEmail("other@example.com");

        String token = jwtService.generateRefreshToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void tokenValidityMillisShouldMatchConfiguredDurations() {
        assertEquals(15L * 60L * 1000L, jwtService.getAccessTokenValidityMillis());
        assertEquals(7L * 24L * 60L * 60L * 1000L, jwtService.getRefreshTokenValidityMillis());
    }

    private static User userWithEmail(String email) {
        User user = new User();
        user.setEmail(email);
        return user;
    }
}
