package com.agriconnect.mapper;

import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserSummaryResponse toSummary(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() == null ? null : user.getRole().getName().name(),
                user.getActive(),
                user.getVerified(),
                user.getProfileImageUrl(),
                user.getPreferredLanguage(),
                user.getCreatedAt()
        );
    }
}
