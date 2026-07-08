package com.agriconnect.service;

import com.agriconnect.constant.HiringStatus;
import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.request.WorkerHiringRequest;
import com.agriconnect.dto.request.WorkerProfileRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import com.agriconnect.dto.response.WorkerHiringResponse;
import com.agriconnect.dto.response.WorkerProfileResponse;
import org.springframework.data.domain.Pageable;

public interface WorkerService {

    PageResponse<WorkerProfileResponse> listApproved(String search, String location, Boolean available, Pageable pageable);

    WorkerProfileResponse getById(Long id);

    WorkerProfileResponse getMyProfile();

    WorkerProfileResponse upsertMyProfile(WorkerProfileRequest request);

    WorkerHiringResponse createHiring(WorkerHiringRequest request);

    PageResponse<WorkerHiringResponse> listMyHiringRequests(Pageable pageable);

    PageResponse<WorkerHiringResponse> listFarmerHiringRequests(Pageable pageable);

    WorkerHiringResponse updateHiringStatus(Long hiringId, HiringStatus status, String notes);

    ReviewResponse addReview(Long workerProfileId, ReviewRequest request);

    PageResponse<ReviewResponse> getReviews(Long workerProfileId, Pageable pageable);

    PageResponse<WorkerProfileResponse> listForAdmin(WorkerApprovalStatus status, String search, Pageable pageable);

    WorkerProfileResponse updateApprovalStatus(Long workerProfileId, WorkerApprovalStatus status);

    java.math.BigDecimal getWorkerEarnings();
}
