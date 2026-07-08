package com.agriconnect.service.impl;

import com.agriconnect.constant.FeedbackStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.FeedbackRequest;
import com.agriconnect.dto.response.FeedbackResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.entity.Feedback;
import com.agriconnect.entity.User;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.mapper.FeedbackMapper;
import com.agriconnect.repository.FeedbackRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final CurrentUserProvider currentUserProvider;

    @Override
    public FeedbackResponse submit(FeedbackRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Feedback feedback = new Feedback();
        feedback.setSubmittedBy(currentUser);
        feedback.setType(request.type());
        feedback.setSubject(request.subject().trim());
        feedback.setMessage(request.message().trim());
        feedback.setStatus(FeedbackStatus.OPEN);
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FeedbackResponse> listMine(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(feedbackRepository.findBySubmittedBy(currentUser, pageable).map(feedbackMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FeedbackResponse> listForAdmin(FeedbackStatus status, Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        if (status == null) {
            return PageResponse.from(feedbackRepository.findAll(pageable).map(feedbackMapper::toResponse));
        }
        return PageResponse.from(feedbackRepository.findByStatus(status, pageable).map(feedbackMapper::toResponse));
    }

    @Override
    public FeedbackResponse updateStatus(Long feedbackId, FeedbackStatus status, String adminResolution) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("feedback.not.found", feedbackId));
        feedback.setStatus(status);
        feedback.setAdminResolution(adminResolution == null || adminResolution.isBlank() ? null : adminResolution.trim());
        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }
}
