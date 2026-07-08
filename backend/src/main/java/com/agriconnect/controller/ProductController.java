package com.agriconnect.controller;

import com.agriconnect.constant.ProductStatus;
import com.agriconnect.dto.request.ProductRequest;
import com.agriconnect.dto.request.ProductStatusUpdateRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductResponse;
import com.agriconnect.service.ProductService;
import com.agriconnect.util.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> listApproved(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean organic,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "product.list.fetched",
                productService.listApproved(search, category, location, available, organic, pageable)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ResponseFactory.success("product.fetched", productService.getById(id)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> listMine(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("product.mine.fetched", productService.listMine(pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("product.created", productService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ResponseFactory.success("product.updated", productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ResponseFactory.success("product.deleted", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateApprovalStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "product.status.updated",
                productService.updateApprovalStatus(id, request.status())
        ));
    }
}
