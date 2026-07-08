package com.agriconnect.entity;

import com.agriconnect.constant.EquipmentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "equipment", indexes = {
        @Index(name = "idx_equipment_category", columnList = "category"),
        @Index(name = "idx_equipment_location", columnList = "location"),
        @Index(name = "idx_equipment_approval_status", columnList = "approval_status")
})
public class Equipment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rentalPricePerDay;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(length = 120)
    private String brand;

    @Column(length = 120)
    private String model;

    @Column(length = 50)
    private String yearOfManufacture;

    @Column(nullable = false)
    private Boolean available = Boolean.TRUE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EquipmentStatus approvalStatus = EquipmentStatus.PENDING;

    @Column(nullable = false)
    private Double averageRating = 0.0;

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EquipmentImage> images = new ArrayList<>();
}
