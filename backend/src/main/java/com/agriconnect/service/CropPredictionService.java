package com.agriconnect.service;

import com.agriconnect.dto.request.CropPredictionRequest;
import com.agriconnect.dto.response.CropPredictionResponse;
import com.agriconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CropPredictionService {

    CropPredictionResponse predict(CropPredictionRequest request);

    PageResponse<CropPredictionResponse> history(Pageable pageable);
}
