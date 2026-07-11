package com.agriconnect.controller;

import com.agriconnect.dto.request.ProductOrderRequest;
import com.agriconnect.dto.request.ProductOrderStatusUpdateRequest;
import com.agriconnect.dto.response.ApiResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductOrderResponse;
import com.agriconnect.service.ProductOrderService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/product-orders")
@RequiredArgsConstructor
public class ProductOrderController {

    private final ProductOrderService productOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER','FARMER','EQUIPMENT_OWNER','WORKER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductOrderResponse>> placeOrder(@Valid @RequestBody ProductOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseFactory.success("order.placed", productOrderService.placeOrder(request)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('BUYER','FARMER','EQUIPMENT_OWNER','WORKER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProductOrderResponse>>> listMyOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("order.list.fetched", productOrderService.listMyOrders(pageable)));
    }

    @GetMapping("/incoming")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProductOrderResponse>>> listIncomingOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ResponseFactory.success("order.incoming.fetched", productOrderService.listIncomingOrders(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductOrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ResponseFactory.success("order.fetched", productOrderService.getById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER','BUYER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductOrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductOrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ResponseFactory.success(
                "order.status.updated",
                productOrderService.updateStatus(id, request.status(), request.notes())
        ));
    }
}
