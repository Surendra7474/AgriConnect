package com.agriconnect.mapper;

import com.agriconnect.dto.response.FeedbackResponse;
import com.agriconnect.entity.Feedback;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeedbackMapper {

    private final UserMapper userMapper;

    public FeedbackResponse toResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                userMapper.toSummary(feedback.getSubmittedBy()),
                feedback.getType().name(),
                feedback.getSubject(),
                feedback.getMessage(),
                feedback.getStatus().name(),
                feedback.getAdminResolution(),
                feedback.getCreatedAt(),
                feedback.getUpdatedAt()
        );
    }
}
