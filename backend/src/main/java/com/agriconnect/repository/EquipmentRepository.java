package com.agriconnect.repository;

import com.agriconnect.constant.EquipmentStatus;
import com.agriconnect.entity.Equipment;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Page<Equipment> findByApprovalStatus(EquipmentStatus approvalStatus, Pageable pageable);

    Page<Equipment> findByOwner(User owner, Pageable pageable);

    Page<Equipment> findByAvailableTrueAndApprovalStatus(EquipmentStatus approvalStatus, Pageable pageable);

    long countByApprovalStatus(EquipmentStatus approvalStatus);

    @Query("""
            select e from Equipment e
            where e.approvalStatus = :status
              and (:category is null or lower(e.category) = lower(:category))
              and (:location is null or lower(e.location) like lower(concat('%', :location, '%')))
              and (:available is null or e.available = :available)
              and (
                    :search is null
                    or lower(e.name) like lower(concat('%', :search, '%'))
                    or lower(coalesce(e.description, '')) like lower(concat('%', :search, '%'))
                    or lower(coalesce(e.brand, '')) like lower(concat('%', :search, '%'))
                  )
            """)
    Page<Equipment> searchApproved(
            @Param("status") EquipmentStatus status,
            @Param("search") String search,
            @Param("category") String category,
            @Param("location") String location,
            @Param("available") Boolean available,
            Pageable pageable
    );

    @Query("""
            select e from Equipment e
            where (:status is null or e.approvalStatus = :status)
              and (:search is null or lower(e.name) like lower(concat('%', :search, '%')))
            """)
    Page<Equipment> searchForAdmin(
            @Param("status") EquipmentStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
