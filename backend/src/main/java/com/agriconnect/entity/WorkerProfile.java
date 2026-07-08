package com.agriconnect.entity;

import com.agriconnect.constant.WorkerApprovalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "worker_profiles")
public class WorkerProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String skills;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyRate;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean available = Boolean.TRUE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private WorkerApprovalStatus approvalStatus = WorkerApprovalStatus.PENDING;

    @Column(nullable = false)
    private Double averageRating = 0.0;
}
