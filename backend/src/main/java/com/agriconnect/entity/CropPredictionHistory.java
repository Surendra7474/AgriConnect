package com.agriconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "crop_prediction_history")
public class CropPredictionHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Column(nullable = false, length = 100)
    private String cropName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal areaHectares;

    @Column(nullable = false, length = 100)
    private String soilType;

    @Column(nullable = false, length = 100)
    private String waterSource;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal investmentAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedYield;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedProfit;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal suitabilityScore;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String riskAnalysis;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendedCrops;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bestPractices;
}
