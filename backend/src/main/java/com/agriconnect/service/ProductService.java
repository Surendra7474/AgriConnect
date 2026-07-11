package com.agriconnect.service;

import com.agriconnect.constant.ProductStatus;
import com.agriconnect.dto.request.ProductRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    PageResponse<ProductResponse> listApproved(String search, String category, String location, Boolean available, Boolean organic, Pageable pageable);

    PageResponse<ProductResponse> listMine(Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    PageResponse<ProductResponse> listForAdmin(ProductStatus status, String search, Pageable pageable);

    ProductResponse updateApprovalStatus(Long productId, ProductStatus status);

    ProductResponse updateQuantity(Long productId, java.math.BigDecimal quantity);

    long countByApprovalStatus(ProductStatus status);
}
