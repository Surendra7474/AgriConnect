package com.agriconnect.service;

import com.agriconnect.constant.OrderStatus;
import com.agriconnect.dto.request.ProductOrderRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductOrderResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface ProductOrderService {

    ProductOrderResponse placeOrder(ProductOrderRequest request);

    ProductOrderResponse updateStatus(Long orderId, OrderStatus status, String notes);

    PageResponse<ProductOrderResponse> listMyOrders(Pageable pageable);

    PageResponse<ProductOrderResponse> listIncomingOrders(Pageable pageable);

    ProductOrderResponse getById(Long orderId);

    long countByStatus(OrderStatus status);

    long countAllOrders();

    BigDecimal sumTotalPaidAmount();
}
