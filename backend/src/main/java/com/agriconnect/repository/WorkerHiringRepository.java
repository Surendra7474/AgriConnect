package com.agriconnect.repository;

import com.agriconnect.constant.HiringStatus;
import com.agriconnect.entity.WorkerHiring;
import com.agriconnect.entity.WorkerProfile;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface WorkerHiringRepository extends JpaRepository<WorkerHiring, Long> {

    List<WorkerHiring> findByWorkerProfile(WorkerProfile workerProfile);

    List<WorkerHiring> findByFarmer(User farmer);

    List<WorkerHiring> findByStatus(HiringStatus status);

    Page<WorkerHiring> findByFarmer(User farmer, Pageable pageable);

    Page<WorkerHiring> findByWorkerProfile_User(User worker, Pageable pageable);

    long countByStatus(HiringStatus status);

    @Query("select coalesce(sum(h.totalAmount), 0) from WorkerHiring h where h.workerProfile.user = :worker and h.status = 'COMPLETED'")
    java.math.BigDecimal sumCompletedPaidByWorker(@Param("worker") User worker);

    @Query("""
            select count(h) > 0 from WorkerHiring h
            where h.workerProfile = :workerProfile
              and h.status in :statuses
              and h.startDate <= :endDate
              and h.endDate >= :startDate
            """)
    boolean existsOverlappingHiring(
            @Param("workerProfile") WorkerProfile workerProfile,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") Collection<HiringStatus> statuses
    );
}
