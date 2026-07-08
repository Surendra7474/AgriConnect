package com.agriconnect.controller;

import com.agriconnect.constant.EquipmentStatus;
import com.agriconnect.constant.FeedbackStatus;
import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.dto.request.EquipmentStatusUpdateRequest;
import com.agriconnect.dto.request.FeedbackResolutionRequest;
import com.agriconnect.dto.request.ProductStatusUpdateRequest;
import com.agriconnect.dto.request.UserStatusUpdateRequest;
import com.agriconnect.dto.request.WorkerApprovalStatusUpdateRequest;
import com.agriconnect.dto.response.AdminDashboardResponse;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.EquipmentResponse;
import com.agriconnect.dto.response.FeedbackResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.dto.response.WorkerProfileResponse;
import com.agriconnect.service.AdminService;
import com.agriconnect.service.EquipmentService;
import com.agriconnect.service.FeedbackService;
import com.agriconnect.service.ProductService;
import com.agriconnect.service.WorkerService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final EquipmentService equipmentService;
    private final WorkerService workerService;
    private final FeedbackService feedbackService;
    private final ProductService productService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ResponseFactory.success("admin.dashboard.fetched", adminService.dashboard()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryResponse>>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RoleName role,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(ResponseFactory.success("admin.users.fetched", adminService.listUsers(pageable, search, role, active)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "admin.user.status.updated",
                adminService.updateUserActiveStatus(userId, request.active())
        ));
    }

    @GetMapping("/equipment")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentResponse>>> listEquipment(
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "equipment.moderation.fetched",
                equipmentService.listForAdmin(status, search, pageable)
        ));
    }

    @PatchMapping("/equipment/{equipmentId}/status")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipmentStatus(
            @PathVariable Long equipmentId,
            @Valid @RequestBody EquipmentStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "equipment.status.updated",
                equipmentService.updateApprovalStatus(equipmentId, request.status())
        ));
    }

    @GetMapping("/workers")
    public ResponseEntity<ApiResponse<PageResponse<WorkerProfileResponse>>> listWorkers(
            @RequestParam(required = false) WorkerApprovalStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "worker.moderation.fetched",
                workerService.listForAdmin(status, search, pageable)
        ));
    }

    @PatchMapping("/workers/{workerProfileId}/status")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> updateWorkerStatus(
            @PathVariable Long workerProfileId,
            @Valid @RequestBody WorkerApprovalStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "worker.status.updated",
                workerService.updateApprovalStatus(workerProfileId, request.status())
        ));
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<PageResponse<FeedbackResponse>>> listFeedback(
            @RequestParam(required = false) FeedbackStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "admin.feedback.list.fetched",
                feedbackService.listForAdmin(status, pageable)
        ));
    }

    @PatchMapping("/feedback/{feedbackId}")
    public ResponseEntity<ApiResponse<FeedbackResponse>> updateFeedback(
            @PathVariable Long feedbackId,
            @Valid @RequestBody FeedbackResolutionRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "admin.feedback.updated",
                feedbackService.updateStatus(feedbackId, request.status(), request.adminResolution())
        ));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> listProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "product.moderation.fetched",
                productService.listForAdmin(status, search, pageable)
        ));
    }

    @PatchMapping("/products/{productId}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable Long productId,
            @Valid @RequestBody ProductStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "product.status.updated",
                productService.updateApprovalStatus(productId, request.status())
        ));
    }
}
