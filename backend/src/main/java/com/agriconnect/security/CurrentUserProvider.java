package com.agriconnect.security;

import com.agriconnect.constant.RoleName;
import com.agriconnect.entity.User;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("common.unauthorized");
        }

        String email = switch (authentication.getPrincipal()) {
            case CustomUserDetails userDetails -> userDetails.getUsername();
            case String username -> username;
            default -> authentication.getName();
        };

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("common.unauthorized"));
    }

    public boolean hasRole(User user, RoleName roleName) {
        return user.getRole() != null && roleName == user.getRole().getName();
    }

    public void requireRole(User user, RoleName roleName) {
        if (!hasRole(user, roleName)) {
            throw new UnauthorizedException("common.access.denied");
        }
    }

    public void requireAnyRole(User user, RoleName... roleNames) {
        boolean allowed = Arrays.stream(roleNames).anyMatch(roleName -> hasRole(user, roleName));
        if (!allowed) {
            throw new UnauthorizedException("common.access.denied");
        }
    }
}
