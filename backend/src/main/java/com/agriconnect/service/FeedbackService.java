package com.agriconnect.service;

import com.agriconnect.constant.FeedbackStatus;
import com.agriconnect.dto.request.FeedbackRequest;
import com.agriconnect.dto.response.FeedbackResponse;
import com.agriconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface FeedbackService {

    FeedbackResponse submit(FeedbackRequest request);

    PageResponse<FeedbackResponse> listMine(Pageable pageable);

    PageResponse<FeedbackResponse> listForAdmin(FeedbackStatus status, Pageable pageable);

    FeedbackResponse updateStatus(Long feedbackId, FeedbackStatus status, String adminResolution);
}
