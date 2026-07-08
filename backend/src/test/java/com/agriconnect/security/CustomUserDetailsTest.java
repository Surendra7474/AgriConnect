package com.agriconnect.security;

import com.agriconnect.constant.RoleName;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CustomUserDetailsTest {

    @Test
    void shouldExposeRoleAuthorityAndUserCredentials() {
        User user = user(RoleName.ADMIN, "admin@example.com", "secret", Boolean.TRUE, Boolean.TRUE);

        CustomUserDetails userDetails = new CustomUserDetails(user);

        assertEquals("admin@example.com", userDetails.getUsername());
        assertEquals("secret", userDetails.getPassword());
        assertEquals(List.of("ROLE_ADMIN"), userDetails.getAuthorities().stream().map(authority -> authority.getAuthority()).toList());
        assertTrue(userDetails.isAccountNonExpired());
        assertTrue(userDetails.isAccountNonLocked());
        assertTrue(userDetails.isCredentialsNonExpired());
        assertTrue(userDetails.isEnabled());
        assertSame(user, userDetails.getUser());
    }

    @Test
    void shouldReflectInactiveOrUnverifiedUserState() {
        User user = user(RoleName.FARMER, "farmer@example.com", "secret", Boolean.FALSE, Boolean.FALSE);

        CustomUserDetails userDetails = new CustomUserDetails(user);

        assertFalse(userDetails.isAccountNonLocked());
        assertFalse(userDetails.isEnabled());
    }

    private static User user(RoleName roleName, String email, String password, Boolean active, Boolean verified) {
        Role role = new Role();
        role.setName(roleName);

        User user = new User();
        user.setRole(role);
        user.setEmail(email);
        user.setPassword(password);
        user.setActive(active);
        user.setVerified(verified);
        return user;
    }
}
