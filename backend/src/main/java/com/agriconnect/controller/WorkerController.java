package com.agriconnect.controller;

import com.agriconnect.dto.request.HiringStatusUpdateRequest;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.request.WorkerHiringRequest;
import com.agriconnect.dto.request.WorkerProfileRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import com.agriconnect.dto.response.WorkerHiringResponse;
import com.agriconnect.dto.response.WorkerProfileResponse;
import com.agriconnect.service.WorkerService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<WorkerProfileResponse>>> listApproved(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean available,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "Workers fetched",
                workerService.listApproved(search, location, available, pageable)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ResponseFactory.success("Worker profile fetched", workerService.getById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ResponseFactory.success("Worker profile fetched", workerService.getMyProfile()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> upsertMyProfile(@Valid @RequestBody WorkerProfileRequest request) {
        return ResponseEntity.ok(ResponseFactory.success("Worker profile saved", workerService.upsertMyProfile(request)));
    }

    @PostMapping("/hiring")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<WorkerHiringResponse>> createHiring(@Valid @RequestBody WorkerHiringRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Hiring request created", workerService.createHiring(request)));
    }

    @GetMapping("/hiring/worker")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<PageResponse<WorkerHiringResponse>>> listMyHiringRequests(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Worker hiring requests fetched", workerService.listMyHiringRequests(pageable)));
    }

    @GetMapping("/hiring/farmer")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<PageResponse<WorkerHiringResponse>>> listFarmerHiringRequests(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Farmer hiring requests fetched", workerService.listFarmerHiringRequests(pageable)));
    }

    @PatchMapping("/hiring/{hiringId}/status")
    public ResponseEntity<ApiResponse<WorkerHiringResponse>> updateHiringStatus(
            @PathVariable Long hiringId,
            @Valid @RequestBody HiringStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "Hiring status updated",
                workerService.updateHiringStatus(hiringId, request.status(), request.notes())
        ));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Review submitted", workerService.addReview(id, request)));
    }

    @GetMapping("/earnings/me")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getWorkerEarnings() {
        java.math.BigDecimal earnings = workerService.getWorkerEarnings();
        return ResponseEntity.ok(ResponseFactory.success("Worker earnings fetched", java.util.Map.of("earnings", earnings)));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Reviews fetched", workerService.getReviews(id, pageable)));
    }
}
