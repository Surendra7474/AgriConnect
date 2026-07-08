package com.agriconnect.controller;

import com.agriconnect.dto.request.CropPredictionRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.CropPredictionResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.service.CropPredictionService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class CropPredictionController {

    private final CropPredictionService cropPredictionService;

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<CropPredictionResponse>> predict(@Valid @RequestBody CropPredictionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("Crop prediction generated", cropPredictionService.predict(request)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<PageResponse<CropPredictionResponse>>> history(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("Prediction history fetched", cropPredictionService.history(pageable)));
    }
}
