package com.agriconnect.controller;

import com.agriconnect.dto.request.BookingStatusUpdateRequest;
import com.agriconnect.dto.request.EquipmentBookingRequest;
import com.agriconnect.dto.request.EquipmentRequest;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.EquipmentBookingResponse;
import com.agriconnect.dto.response.EquipmentResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import com.agriconnect.service.EquipmentService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EquipmentResponse>>> listApproved(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean available,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "Equipment listings fetched",
                equipmentService.listApproved(search, category, location, available, pageable)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ResponseFactory.success("Equipment fetched", equipmentService.getById(id)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentResponse>>> listMine(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("My equipment fetched", equipmentService.listMine(pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> create(@Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Equipment submitted successfully", equipmentService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> update(@PathVariable Long id, @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ResponseFactory.success("Equipment updated successfully", equipmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ResponseFactory.success("Equipment deleted successfully", null));
    }

    @PostMapping("/bookings")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<EquipmentBookingResponse>> createBooking(@Valid @RequestBody EquipmentBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Booking request created", equipmentService.createBooking(request)));
    }

    @GetMapping("/bookings/my")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentBookingResponse>>> listMyBookings(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("My equipment bookings fetched", equipmentService.listMyBookings(pageable)));
    }

    @GetMapping("/bookings/owner")
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentBookingResponse>>> listOwnerBookings(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Owner booking requests fetched", equipmentService.listOwnerBookings(pageable)));
    }

    @PatchMapping("/bookings/{bookingId}/status")
    public ResponseEntity<ApiResponse<EquipmentBookingResponse>> updateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "Booking status updated",
                equipmentService.updateBookingStatus(bookingId, request.status(), request.notes())
        ));
    }

    @GetMapping("/earnings/owner")
    @PreAuthorize("hasAnyRole('EQUIPMENT_OWNER','ADMIN')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getOwnerEarnings() {
        java.math.BigDecimal earnings = equipmentService.getOwnerEarnings();
        return ResponseEntity.ok(ResponseFactory.success("Owner earnings fetched", java.util.Map.of("earnings", earnings)));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Review submitted", equipmentService.addReview(id, request)));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Reviews fetched", equipmentService.getReviews(id, pageable)));
    }
}
