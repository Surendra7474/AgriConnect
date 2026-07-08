package com.agriconnect.repository;

import com.agriconnect.constant.BookingStatus;
import com.agriconnect.entity.EquipmentBooking;
import com.agriconnect.entity.Equipment;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {

    List<EquipmentBooking> findByEquipment(Equipment equipment);

    List<EquipmentBooking> findByFarmer(User farmer);

    Page<EquipmentBooking> findByFarmer(User farmer, Pageable pageable);

    Page<EquipmentBooking> findByEquipment_Owner(User owner, Pageable pageable);

    long countByStatus(BookingStatus status);

    @Query("select coalesce(sum(b.totalAmount), 0) from EquipmentBooking b where b.equipment.owner = :owner and b.status = 'COMPLETED'")
    java.math.BigDecimal sumCompletedPaidByOwner(@Param("owner") User owner);

    @Query("""
            select count(b) > 0 from EquipmentBooking b
            where b.equipment = :equipment
              and b.status in :statuses
              and b.bookingDate <= :returnDate
              and b.returnDate >= :bookingDate
            """)
    boolean existsOverlappingBooking(
            @Param("equipment") Equipment equipment,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("returnDate") LocalDate returnDate,
            @Param("statuses") Collection<BookingStatus> statuses
    );
}
