package com.agriconnect.service.impl;

import com.agriconnect.dto.request.CropPredictionRequest;
import com.agriconnect.dto.response.CropPredictionResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.entity.CropPredictionHistory;
import com.agriconnect.entity.User;
import com.agriconnect.mapper.CropPredictionMapper;
import com.agriconnect.repository.CropPredictionHistoryRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.CropPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class CropPredictionServiceImpl implements CropPredictionService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private static final Map<String, CropRule> RULES = Map.of(
            "rice", new CropRule("Rice", decimal("4.20"), decimal("22000"), Set.of("clay", "alluvial", "loam"), List.of("Rice", "Jute", "Sugarcane"), List.of("Maintain standing water during early growth", "Use certified seed varieties", "Monitor blast and stem borer symptoms weekly")),
            "wheat", new CropRule("Wheat", decimal("3.40"), decimal("24500"), Set.of("loam", "alluvial", "sandy loam"), List.of("Wheat", "Mustard", "Gram"), List.of("Use timely sowing after soil moisture stabilizes", "Apply balanced nitrogen in split doses", "Avoid waterlogging during tillering")),
            "maize", new CropRule("Maize", decimal("5.00"), decimal("19000"), Set.of("loam", "sandy loam", "black"), List.of("Maize", "Soybean", "Groundnut"), List.of("Keep plant spacing uniform", "Use drip or furrow irrigation for dry spells", "Scout for fall armyworm during vegetative stage")),
            "cotton", new CropRule("Cotton", decimal("2.10"), decimal("62000"), Set.of("black", "loam", "red"), List.of("Cotton", "Soybean", "Pigeon Pea"), List.of("Prefer well-drained black soil", "Use integrated pest management for bollworm", "Avoid excess irrigation near boll opening")),
            "sugarcane", new CropRule("Sugarcane", decimal("75.00"), decimal("3300"), Set.of("loam", "alluvial", "clay loam"), List.of("Sugarcane", "Rice", "Vegetables"), List.of("Use healthy setts and trench planting", "Trash mulch to retain moisture", "Schedule irrigation around grand growth stage"))
    );

    private final CropPredictionHistoryRepository historyRepository;
    private final CropPredictionMapper cropPredictionMapper;
    private final CurrentUserProvider currentUserProvider;

    @Override
    public CropPredictionResponse predict(CropPredictionRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        CropRule rule = resolveRule(request.cropName());
        BigDecimal suitabilityScore = calculateSuitabilityScore(request, rule);
        BigDecimal estimatedYield = rule.baseYieldPerHectare()
                .multiply(request.areaHectares())
                .multiply(suitabilityScore)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal estimatedRevenue = estimatedYield.multiply(rule.marketPricePerUnit());
        BigDecimal estimatedProfit = estimatedRevenue.subtract(request.investmentAmount()).setScale(2, RoundingMode.HALF_UP);

        CropPredictionHistory history = new CropPredictionHistory();
        history.setRequestedBy(currentUser);
        history.setCropName(rule.displayName());
        history.setAreaHectares(request.areaHectares());
        history.setSoilType(request.soilType().trim());
        history.setWaterSource(request.waterSource().trim());
        history.setRegion(request.region().trim());
        history.setInvestmentAmount(request.investmentAmount());
        history.setEstimatedYield(estimatedYield);
        history.setEstimatedProfit(estimatedProfit);
        history.setSuitabilityScore(suitabilityScore);
        history.setRiskAnalysis(buildRiskAnalysis(request, suitabilityScore, estimatedProfit));
        history.setRecommendedCrops(String.join("|", rule.recommendedCrops()));
        history.setBestPractices(String.join("|", rule.bestPractices()));

        return cropPredictionMapper.toResponse(historyRepository.save(history));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CropPredictionResponse> history(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(historyRepository.findByRequestedByOrderByCreatedAtDesc(currentUser, pageable).map(cropPredictionMapper::toResponse));
    }

    private CropRule resolveRule(String cropName) {
        String normalized = cropName.trim().toLowerCase(Locale.ROOT);
        return RULES.getOrDefault(normalized, new CropRule(
                cropName.trim(),
                decimal("3.00"),
                decimal("21000"),
                Set.of("loam", "alluvial", "black"),
                List.of(cropName.trim(), "Maize", "Pulses"),
                List.of("Run a local soil test before sowing", "Use region-appropriate certified seeds", "Track input costs against market prices weekly")
        ));
    }

    private BigDecimal calculateSuitabilityScore(CropPredictionRequest request, CropRule rule) {
        int score = 55;
        String soil = request.soilType().trim().toLowerCase(Locale.ROOT);
        if (rule.suitableSoils().contains(soil)) {
            score += 20;
        } else if (soil.contains("loam")) {
            score += 10;
        }

        String waterSource = request.waterSource().trim().toLowerCase(Locale.ROOT);
        if (waterSource.contains("canal") || waterSource.contains("irrigation") || waterSource.contains("borewell")) {
            score += 15;
        } else if (waterSource.contains("rain")) {
            score += 5;
        }

        BigDecimal investmentPerHectare = request.investmentAmount().divide(request.areaHectares(), 2, RoundingMode.HALF_UP);
        if (investmentPerHectare.compareTo(decimal("35000")) >= 0) {
            score += 10;
        } else if (investmentPerHectare.compareTo(decimal("18000")) >= 0) {
            score += 5;
        } else {
            score -= 5;
        }
        return BigDecimal.valueOf(Math.max(25, Math.min(100, score))).setScale(2, RoundingMode.HALF_UP);
    }

    private String buildRiskAnalysis(CropPredictionRequest request, BigDecimal suitabilityScore, BigDecimal estimatedProfit) {
        StringBuilder analysis = new StringBuilder();
        if (suitabilityScore.compareTo(decimal("75")) >= 0) {
            analysis.append("Low agronomic risk. ");
        } else if (suitabilityScore.compareTo(decimal("55")) >= 0) {
            analysis.append("Moderate agronomic risk. ");
        } else {
            analysis.append("High agronomic risk. ");
        }
        if (estimatedProfit.signum() < 0) {
            analysis.append("Projected profit is negative, so reduce input cost or reconsider crop selection. ");
        } else {
            analysis.append("Projected profit is positive under the current assumptions. ");
        }
        if (request.waterSource().toLowerCase(Locale.ROOT).contains("rain")) {
            analysis.append("Rain-fed planning increases rainfall variability risk.");
        } else {
            analysis.append("Assured water source reduces moisture stress risk.");
        }
        return analysis.toString().trim();
    }

    private static BigDecimal decimal(String value) {
        return new BigDecimal(value);
    }

    private record CropRule(
            String displayName,
            BigDecimal baseYieldPerHectare,
            BigDecimal marketPricePerUnit,
            Set<String> suitableSoils,
            List<String> recommendedCrops,
            List<String> bestPractices
    ) {
    }
}
