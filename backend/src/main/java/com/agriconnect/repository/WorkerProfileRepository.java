package com.agriconnect.repository;

import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.entity.WorkerProfile;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {

    Optional<WorkerProfile> findByUser(User user);

    boolean existsByUser(User user);

    Page<WorkerProfile> findByApprovalStatus(WorkerApprovalStatus approvalStatus, Pageable pageable);

    long countByApprovalStatus(WorkerApprovalStatus approvalStatus);

    @Query("""
            select w from WorkerProfile w
            where w.approvalStatus = :status
              and (:available is null or w.available = :available)
              and (:location is null or lower(w.location) like lower(concat('%', :location, '%')))
              and (
                    :search is null
                    or lower(w.skills) like lower(concat('%', :search, '%'))
                    or lower(coalesce(w.bio, '')) like lower(concat('%', :search, '%'))
                    or lower(w.user.fullName) like lower(concat('%', :search, '%'))
                  )
            """)
    Page<WorkerProfile> searchApproved(
            @Param("status") WorkerApprovalStatus status,
            @Param("search") String search,
            @Param("location") String location,
            @Param("available") Boolean available,
            Pageable pageable
    );

    @Query("""
            select w from WorkerProfile w
            where (:status is null or w.approvalStatus = :status)
              and (:search is null or lower(w.user.fullName) like lower(concat('%', :search, '%')))
            """)
    Page<WorkerProfile> searchForAdmin(
            @Param("status") WorkerApprovalStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
