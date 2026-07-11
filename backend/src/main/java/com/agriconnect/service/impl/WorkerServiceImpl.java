package com.agriconnect.service.impl;

import com.agriconnect.constant.HiringStatus;
import com.agriconnect.constant.NotificationType;
import com.agriconnect.constant.RoleName;
import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.request.WorkerHiringRequest;
import com.agriconnect.dto.request.WorkerProfileRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import com.agriconnect.dto.response.WorkerHiringResponse;
import com.agriconnect.dto.response.WorkerProfileResponse;
import com.agriconnect.entity.User;
import com.agriconnect.entity.WorkerHiring;
import com.agriconnect.entity.WorkerProfile;
import com.agriconnect.entity.WorkerReview;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.WorkerMapper;
import com.agriconnect.repository.WorkerHiringRepository;
import com.agriconnect.repository.WorkerProfileRepository;
import com.agriconnect.repository.WorkerReviewRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.NotificationService;
import com.agriconnect.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkerServiceImpl implements WorkerService {

    private static final List<HiringStatus> BLOCKING_HIRING_STATUSES = List.of(
            HiringStatus.PENDING,
            HiringStatus.ACCEPTED,
            HiringStatus.IN_PROGRESS
    );

    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerHiringRepository workerHiringRepository;
    private final WorkerReviewRepository workerReviewRepository;
    private final WorkerMapper workerMapper;
    private final CurrentUserProvider currentUserProvider;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkerProfileResponse> listApproved(String search, String location, Boolean available, Pageable pageable) {
        return PageResponse.from(workerProfileRepository.searchApproved(
                WorkerApprovalStatus.APPROVED,
                clean(search),
                clean(location),
                available,
                pageable
        ).map(workerMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerProfileResponse getById(Long id) {
        WorkerProfile profile = findProfile(id);
        User currentUser = currentUserProvider.getCurrentUser();
        boolean owner = profile.getUser().getId().equals(currentUser.getId());
        if (profile.getApprovalStatus() != WorkerApprovalStatus.APPROVED
                && !owner
                && !currentUserProvider.hasRole(currentUser, RoleName.ADMIN)) {
            throw new UnauthorizedException("worker.not.visible");
        }
        return workerMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkerProfileResponse getMyProfile() {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.WORKER);
        WorkerProfile profile = workerProfileRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("worker.not.found", currentUser.getId()));
        return workerMapper.toResponse(profile);
    }

    @Override
    public WorkerProfileResponse upsertMyProfile(WorkerProfileRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.WORKER);

        WorkerProfile profile = workerProfileRepository.findByUser(currentUser).orElseGet(() -> {
            WorkerProfile newProfile = new WorkerProfile();
            newProfile.setUser(currentUser);
            // Only set PENDING for new (first-time) profiles
            newProfile.setApprovalStatus(WorkerApprovalStatus.PENDING);
            return newProfile;
        });
        profile.setSkills(request.skills().trim());
        profile.setLocation(request.location().trim());
        profile.setDailyRate(request.dailyRate());
        profile.setBio(clean(request.bio()));
        profile.setPhoneNumber(clean(request.phoneNumber()));
        profile.setAvailable(request.available() == null || request.available());

        // Do NOT reset approvalStatus for existing profiles - edits go live immediately without admin re-approval

        return workerMapper.toResponse(workerProfileRepository.save(profile));
    }

    @Override
    public WorkerHiringResponse createHiring(WorkerHiringRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.FARMER);
        WorkerProfile profile = findProfile(request.workerProfileId());

        if (profile.getApprovalStatus() != WorkerApprovalStatus.APPROVED || !Boolean.TRUE.equals(profile.getAvailable())) {
            throw new BadRequestException("worker.not.available", profile.getUser().getFullName());
        }
        if (profile.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("worker.cannot.hire.self");
        }
        validateDateRange(request.startDate(), request.endDate());
        if (workerHiringRepository.existsOverlappingHiring(profile, request.startDate(), request.endDate(), BLOCKING_HIRING_STATUSES)) {
            throw new BadRequestException("worker.already.hired");
        }

        long workingDays = ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;
        BigDecimal totalAmount = profile.getDailyRate().multiply(BigDecimal.valueOf(workingDays));

        WorkerHiring hiring = new WorkerHiring();
        hiring.setWorkerProfile(profile);
        hiring.setFarmer(currentUser);
        hiring.setStartDate(request.startDate());
        hiring.setEndDate(request.endDate());
        hiring.setTotalAmount(totalAmount);
        hiring.setStatus(HiringStatus.PENDING);
        hiring.setNotes(request.notes());

        WorkerHiring saved = workerHiringRepository.save(hiring);
        notificationService.createSystemNotification(
                profile.getUser(),
                "New hiring request",
                currentUser.getFullName() + " requested your services",
                NotificationType.HIRING,
                "WorkerHiring",
                saved.getId().toString()
        );
        return workerMapper.toHiringResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkerHiringResponse> listMyHiringRequests(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.WORKER);
        return PageResponse.from(workerHiringRepository.findByWorkerProfile_User(currentUser, pageable).map(workerMapper::toHiringResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkerHiringResponse> listFarmerHiringRequests(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.FARMER);
        return PageResponse.from(workerHiringRepository.findByFarmer(currentUser, pageable).map(workerMapper::toHiringResponse));
    }

    @Override
    public WorkerHiringResponse updateHiringStatus(Long hiringId, HiringStatus status, String notes) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkerHiring hiring = workerHiringRepository.findById(hiringId)
                .orElseThrow(() -> new ResourceNotFoundException("worker.hiring.not.found", hiringId));

        boolean worker = hiring.getWorkerProfile().getUser().getId().equals(currentUser.getId());
        boolean farmer = hiring.getFarmer().getId().equals(currentUser.getId());
        boolean admin = currentUserProvider.hasRole(currentUser, RoleName.ADMIN);
        if (!admin && !worker && !(farmer && status == HiringStatus.CANCELLED)) {
            throw new UnauthorizedException("worker.not.authorized");
        }

        hiring.setStatus(status);
        if (notes != null && !notes.isBlank()) {
            hiring.setNotes(notes);
        }
        WorkerHiring saved = workerHiringRepository.save(hiring);
        notificationService.createSystemNotification(
                hiring.getFarmer(),
                "Hiring request " + status.name().toLowerCase(),
                hiring.getWorkerProfile().getUser().getFullName() + " hiring status changed to " + status.name(),
                NotificationType.HIRING,
                "WorkerHiring",
                saved.getId().toString()
        );
        return workerMapper.toHiringResponse(saved);
    }

    @Override
    public ReviewResponse addReview(Long workerProfileId, ReviewRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        WorkerProfile profile = findProfile(workerProfileId);
        if (profile.getApprovalStatus() != WorkerApprovalStatus.APPROVED) {
            throw new BadRequestException("worker.cannot.review.unapproved");
        }
        WorkerReview review = new WorkerReview();
        review.setWorkerProfile(profile);
        review.setReviewer(currentUser);
        review.setRating(request.rating());
        review.setComment(clean(request.comment()));
        WorkerReview saved = workerReviewRepository.save(review);

        double avgRating = workerReviewRepository.findByWorkerProfileIdOrderByCreatedAtDesc(workerProfileId, Pageable.unpaged())
                .stream().mapToInt(WorkerReview::getRating).average().orElse(0.0);
        profile.setAverageRating(avgRating);
        workerProfileRepository.save(profile);

        return new ReviewResponse(
                saved.getId(), saved.getRating(), saved.getComment(),
                currentUser.getFullName(), currentUser.getId(), saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviews(Long workerProfileId, Pageable pageable) {
        return PageResponse.from(workerReviewRepository
                .findByWorkerProfileIdOrderByCreatedAtDesc(workerProfileId, pageable)
                .map(review -> new ReviewResponse(
                        review.getId(), review.getRating(), review.getComment(),
                        review.getReviewer().getFullName(), review.getReviewer().getId(), review.getCreatedAt()
                )));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkerProfileResponse> listForAdmin(WorkerApprovalStatus status, String search, Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        return PageResponse.from(workerProfileRepository.searchForAdmin(status, clean(search), pageable).map(workerMapper::toResponse));
    }

    @Override
    public WorkerProfileResponse updateApprovalStatus(Long workerProfileId, WorkerApprovalStatus status) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        WorkerProfile profile = findProfile(workerProfileId);
        profile.setApprovalStatus(status);
        WorkerProfile saved = workerProfileRepository.save(profile);
        notificationService.createSystemNotification(
                profile.getUser(),
                "Worker profile approval updated",
                "Your worker profile is now " + status.name(),
                NotificationType.APPROVAL,
                "WorkerProfile",
                saved.getId().toString()
        );
        return workerMapper.toResponse(saved);
    }

    private WorkerProfile findProfile(Long id) {
        return workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("worker.not.found", id));
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("worker.date.invalid");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.math.BigDecimal getWorkerEarnings() {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.WORKER);
        java.math.BigDecimal earnings = workerHiringRepository.sumCompletedPaidByWorker(currentUser);
        return earnings != null ? earnings : java.math.BigDecimal.ZERO;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
