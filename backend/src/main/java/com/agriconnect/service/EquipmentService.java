package com.agriconnect.service;

import com.agriconnect.constant.BookingStatus;
import com.agriconnect.constant.EquipmentStatus;
import com.agriconnect.dto.request.EquipmentBookingRequest;
import com.agriconnect.dto.request.EquipmentRequest;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.response.EquipmentBookingResponse;
import com.agriconnect.dto.response.EquipmentResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface EquipmentService {

    PageResponse<EquipmentResponse> listApproved(String search, String category, String location, Boolean available, Pageable pageable);

    PageResponse<EquipmentResponse> listMine(Pageable pageable);

    EquipmentResponse getById(Long id);

    EquipmentResponse create(EquipmentRequest request);

    EquipmentResponse update(Long id, EquipmentRequest request);

    void delete(Long id);

    EquipmentBookingResponse createBooking(EquipmentBookingRequest request);

    PageResponse<EquipmentBookingResponse> listMyBookings(Pageable pageable);

    PageResponse<EquipmentBookingResponse> listOwnerBookings(Pageable pageable);

    EquipmentBookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String notes);

    ReviewResponse addReview(Long equipmentId, ReviewRequest request);

    PageResponse<ReviewResponse> getReviews(Long equipmentId, Pageable pageable);

    PageResponse<EquipmentResponse> listForAdmin(EquipmentStatus status, String search, Pageable pageable);

    EquipmentResponse updateApprovalStatus(Long equipmentId, EquipmentStatus status);

    java.math.BigDecimal getOwnerEarnings();
}
