package com.agriconnect.mapper;

import com.agriconnect.dto.response.EquipmentBookingResponse;
import com.agriconnect.dto.response.EquipmentResponse;
import com.agriconnect.entity.Equipment;
import com.agriconnect.entity.EquipmentBooking;
import com.agriconnect.entity.EquipmentImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EquipmentMapper {

    private final UserMapper userMapper;

    public EquipmentResponse toResponse(Equipment equipment) {
        List<String> imageUrls = equipment.getImages() == null
                ? List.of()
                : equipment.getImages().stream()
                        .map(EquipmentImage::getImageUrl)
                        .toList();

        return new EquipmentResponse(
                equipment.getId(),
                userMapper.toSummary(equipment.getOwner()),
                equipment.getName(),
                equipment.getCategory(),
                equipment.getDescription(),
                equipment.getRentalPricePerDay(),
                equipment.getSecurityDeposit(),
                equipment.getLocation(),
                equipment.getBrand(),
                equipment.getModel(),
                equipment.getYearOfManufacture(),
                equipment.getAvailable(),
                equipment.getApprovalStatus().name(),
                equipment.getAverageRating(),
                imageUrls,
                equipment.getCreatedAt(),
                equipment.getUpdatedAt()
        );
    }

    public EquipmentBookingResponse toBookingResponse(EquipmentBooking booking) {
        Equipment equipment = booking.getEquipment();
        return new EquipmentBookingResponse(
                booking.getId(),
                equipment.getId(),
                equipment.getName(),
                userMapper.toSummary(booking.getFarmer()),
                userMapper.toSummary(equipment.getOwner()),
                booking.getBookingDate(),
                booking.getReturnDate(),
                booking.getTotalAmount(),
                booking.getStatus().name(),
                booking.getNotes(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
