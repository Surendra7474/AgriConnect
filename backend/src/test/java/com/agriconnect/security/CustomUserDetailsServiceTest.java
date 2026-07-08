package com.agriconnect.security;

import com.agriconnect.constant.RoleName;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new CustomUserDetailsService(userRepository);
    }

    @Test
    void loadUserByUsernameShouldReturnCustomUserDetailsWhenUserExists() {
        User user = user(RoleName.WORKER, "worker@example.com");
        when(userRepository.findByEmailIgnoreCase("worker@example.com")).thenReturn(Optional.of(user));

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername("worker@example.com");

        assertEquals("worker@example.com", userDetails.getUsername());
        assertEquals("ROLE_WORKER", userDetails.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void loadUserByUsernameShouldThrowWhenUserDoesNotExist() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("missing@example.com"));

        assertEquals("User not found with email: missing@example.com", exception.getMessage());
    }

    private static User user(RoleName roleName, String email) {
        Role role = new Role();
        role.setName(roleName);

        User user = new User();
        user.setRole(role);
        user.setEmail(email);
        user.setPassword("secret");
        user.setActive(Boolean.TRUE);
        user.setVerified(Boolean.TRUE);
        return user;
    }
}
