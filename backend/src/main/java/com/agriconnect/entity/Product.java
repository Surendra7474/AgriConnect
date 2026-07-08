package com.agriconnect.entity;

import com.agriconnect.constant.ProductStatus;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_category", columnList = "category"),
        @Index(name = "idx_product_location", columnList = "location"),
        @Index(name = "idx_product_approval_status", columnList = "approval_status")
})
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantityAvailable;

    @Column(nullable = false)
    private LocalDate harvestDate;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false)
    private Boolean organic = Boolean.FALSE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProductStatus approvalStatus = ProductStatus.PENDING;

    @Column(nullable = false)
    private Boolean active = Boolean.TRUE;

    @Column(nullable = false)
    private Double averageRating = 0.0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();
}
