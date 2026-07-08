package com.agriconnect.service.impl;

import com.agriconnect.constant.BookingStatus;
import com.agriconnect.constant.EquipmentStatus;
import com.agriconnect.constant.NotificationType;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.EquipmentBookingRequest;
import com.agriconnect.dto.request.EquipmentRequest;
import com.agriconnect.dto.request.ReviewRequest;
import com.agriconnect.dto.response.EquipmentBookingResponse;
import com.agriconnect.dto.response.EquipmentResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ReviewResponse;
import com.agriconnect.entity.Equipment;
import com.agriconnect.entity.EquipmentBooking;
import com.agriconnect.entity.EquipmentImage;
import com.agriconnect.entity.EquipmentReview;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.EquipmentMapper;
import com.agriconnect.repository.EquipmentBookingRepository;
import com.agriconnect.repository.EquipmentRepository;
import com.agriconnect.repository.EquipmentReviewRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.EquipmentService;
import com.agriconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentServiceImpl implements EquipmentService {

    private static final List<BookingStatus> BLOCKING_BOOKING_STATUSES = List.of(
            BookingStatus.PENDING,
            BookingStatus.APPROVED,
            BookingStatus.ACTIVE
    );

    private final EquipmentRepository equipmentRepository;
    private final EquipmentBookingRepository equipmentBookingRepository;
    private final EquipmentReviewRepository equipmentReviewRepository;
    private final EquipmentMapper equipmentMapper;
    private final CurrentUserProvider currentUserProvider;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> listApproved(String search, String category, String location, Boolean available, Pageable pageable) {
        return PageResponse.from(equipmentRepository.searchApproved(
                EquipmentStatus.APPROVED,
                clean(search),
                clean(category),
                clean(location),
                available,
                pageable
        ).map(equipmentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> listMine(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(equipmentRepository.findByOwner(currentUser, pageable).map(equipmentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getById(Long id) {
        Equipment equipment = findEquipment(id);
        User currentUser = currentUserProvider.getCurrentUser();
        if (equipment.getApprovalStatus() != EquipmentStatus.APPROVED && !canManageEquipment(currentUser, equipment)) {
            throw new UnauthorizedException("equipment.not.visible");
        }
        return equipmentMapper.toResponse(equipment);
    }

    @Override
    public EquipmentResponse create(EquipmentRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireAnyRole(currentUser, RoleName.EQUIPMENT_OWNER, RoleName.ADMIN);

        Equipment equipment = new Equipment();
        equipment.setOwner(currentUser);
        applyRequest(equipment, request);
        equipment.setApprovalStatus(currentUserProvider.hasRole(currentUser, RoleName.ADMIN)
                ? EquipmentStatus.APPROVED
                : EquipmentStatus.PENDING);

        Equipment saved = equipmentRepository.save(equipment);
        return equipmentMapper.toResponse(saved);
    }

    @Override
    public EquipmentResponse update(Long id, EquipmentRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Equipment equipment = findEquipment(id);
        requireEquipmentManager(currentUser, equipment);

        applyRequest(equipment, request);
        if (!currentUserProvider.hasRole(currentUser, RoleName.ADMIN)) {
            equipment.setApprovalStatus(EquipmentStatus.PENDING);
        }
        return equipmentMapper.toResponse(equipmentRepository.save(equipment));
    }

    @Override
    public void delete(Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        Equipment equipment = findEquipment(id);
        requireEquipmentManager(currentUser, equipment);
        equipmentRepository.delete(equipment);
    }

    @Override
    public EquipmentBookingResponse createBooking(EquipmentBookingRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.FARMER);
        Equipment equipment = findEquipment(request.equipmentId());

        if (equipment.getApprovalStatus() != EquipmentStatus.APPROVED || !Boolean.TRUE.equals(equipment.getAvailable())) {
            throw new BadRequestException("equipment.not.available");
        }
        if (equipment.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("equipment.own.booking");
        }
        validateDateRange(request.bookingDate(), request.returnDate(), "equipment.date.invalid");
        if (equipmentBookingRepository.existsOverlappingBooking(equipment, request.bookingDate(), request.returnDate(), BLOCKING_BOOKING_STATUSES)) {
            throw new BadRequestException("equipment.already.booked");
        }

        long rentalDays = ChronoUnit.DAYS.between(request.bookingDate(), request.returnDate()) + 1;
        BigDecimal totalAmount = equipment.getRentalPricePerDay()
                .multiply(BigDecimal.valueOf(rentalDays))
                .add(equipment.getSecurityDeposit());

        EquipmentBooking booking = new EquipmentBooking();
        booking.setEquipment(equipment);
        booking.setFarmer(currentUser);
        booking.setBookingDate(request.bookingDate());
        booking.setReturnDate(request.returnDate());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.PENDING);
        booking.setNotes(request.notes());

        EquipmentBooking saved = equipmentBookingRepository.save(booking);
        notificationService.createSystemNotification(
                equipment.getOwner(),
                "New equipment booking request",
                currentUser.getFullName() + " requested " + equipment.getName(),
                NotificationType.BOOKING,
                "EquipmentBooking",
                saved.getId().toString()
        );
        return equipmentMapper.toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentBookingResponse> listMyBookings(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(equipmentBookingRepository.findByFarmer(currentUser, pageable).map(equipmentMapper::toBookingResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentBookingResponse> listOwnerBookings(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireAnyRole(currentUser, RoleName.EQUIPMENT_OWNER, RoleName.ADMIN);
        return PageResponse.from(equipmentBookingRepository.findByEquipment_Owner(currentUser, pageable).map(equipmentMapper::toBookingResponse));
    }

    @Override
    public EquipmentBookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String notes) {
        User currentUser = currentUserProvider.getCurrentUser();
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("equipment.booking.not.found", bookingId));

        boolean manager = canManageEquipment(currentUser, booking.getEquipment());
        boolean bookingFarmer = booking.getFarmer().getId().equals(currentUser.getId());
        if (!manager && !(bookingFarmer && status == BookingStatus.CANCELLED)) {
            throw new UnauthorizedException("equipment.not.owner");
        }

        booking.setStatus(status);
        if (notes != null && !notes.isBlank()) {
            booking.setNotes(notes);
        }
        EquipmentBooking saved = equipmentBookingRepository.save(booking);

        notificationService.createSystemNotification(
                booking.getFarmer(),
                "Equipment booking " + status.name().toLowerCase(),
                booking.getEquipment().getName() + " booking status changed to " + status.name(),
                NotificationType.BOOKING,
                "EquipmentBooking",
                saved.getId().toString()
        );
        return equipmentMapper.toBookingResponse(saved);
    }

    @Override
    public ReviewResponse addReview(Long equipmentId, ReviewRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Equipment equipment = findEquipment(equipmentId);
        if (equipment.getApprovalStatus() != EquipmentStatus.APPROVED) {
            throw new BadRequestException("equipment.cannot.review.unapproved");
        }
        EquipmentReview review = new EquipmentReview();
        review.setEquipment(equipment);
        review.setReviewer(currentUser);
        review.setRating(request.rating());
        review.setComment(clean(request.comment()));
        EquipmentReview saved = equipmentReviewRepository.save(review);

        double avgRating = equipmentReviewRepository.findByEquipmentIdOrderByCreatedAtDesc(equipmentId, Pageable.unpaged())
                .stream().mapToInt(EquipmentReview::getRating).average().orElse(0.0);
        equipment.setAverageRating(avgRating);
        equipmentRepository.save(equipment);

        return new ReviewResponse(
                saved.getId(), saved.getRating(), saved.getComment(),
                currentUser.getFullName(), currentUser.getId(), saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviews(Long equipmentId, Pageable pageable) {
        return PageResponse.from(equipmentReviewRepository
                .findByEquipmentIdOrderByCreatedAtDesc(equipmentId, pageable)
                .map(review -> new ReviewResponse(
                        review.getId(), review.getRating(), review.getComment(),
                        review.getReviewer().getFullName(), review.getReviewer().getId(), review.getCreatedAt()
                )));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentResponse> listForAdmin(EquipmentStatus status, String search, Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        return PageResponse.from(equipmentRepository.searchForAdmin(status, clean(search), pageable).map(equipmentMapper::toResponse));
    }

    @Override
    public EquipmentResponse updateApprovalStatus(Long equipmentId, EquipmentStatus status) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        Equipment equipment = findEquipment(equipmentId);
        equipment.setApprovalStatus(status);
        Equipment saved = equipmentRepository.save(equipment);

        notificationService.createSystemNotification(
                equipment.getOwner(),
                "Equipment approval updated",
                equipment.getName() + " is now " + status.name(),
                NotificationType.APPROVAL,
                "Equipment",
                saved.getId().toString()
        );
        return equipmentMapper.toResponse(saved);
    }

    private void applyRequest(Equipment equipment, EquipmentRequest request) {
        equipment.setName(request.name().trim());
        equipment.setCategory(request.category().trim());
        equipment.setDescription(clean(request.description()));
        equipment.setRentalPricePerDay(request.rentalPricePerDay());
        equipment.setSecurityDeposit(request.securityDeposit());
        equipment.setLocation(request.location().trim());
        equipment.setBrand(clean(request.brand()));
        equipment.setModel(clean(request.model()));
        equipment.setYearOfManufacture(clean(request.yearOfManufacture()));
        equipment.setAvailable(request.available() == null || request.available());
        replaceImages(equipment, request.imageUrls());
    }

    private void replaceImages(Equipment equipment, List<String> imageUrls) {
        equipment.getImages().clear();
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        for (int index = 0; index < imageUrls.size(); index++) {
            EquipmentImage image = new EquipmentImage();
            image.setEquipment(equipment);
            image.setImageUrl(imageUrls.get(index).trim());
            image.setPrimaryImage(index == 0);
            equipment.getImages().add(image);
        }
    }

    private Equipment findEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("equipment.not.found", id));
    }

    private boolean canManageEquipment(User user, Equipment equipment) {
        return currentUserProvider.hasRole(user, RoleName.ADMIN)
                || equipment.getOwner().getId().equals(user.getId());
    }

    private void requireEquipmentManager(User user, Equipment equipment) {
        if (!canManageEquipment(user, equipment)) {
            throw new UnauthorizedException("equipment.not.owner");
        }
    }

    private void validateDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate, String messageKey) {
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException(messageKey);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.math.BigDecimal getOwnerEarnings() {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireAnyRole(currentUser, RoleName.EQUIPMENT_OWNER, RoleName.ADMIN);
        java.math.BigDecimal earnings = equipmentBookingRepository.sumCompletedPaidByOwner(currentUser);
        return earnings != null ? earnings : java.math.BigDecimal.ZERO;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
