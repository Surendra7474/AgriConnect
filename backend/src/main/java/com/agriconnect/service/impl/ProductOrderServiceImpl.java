package com.agriconnect.service.impl;

import com.agriconnect.constant.NotificationType;
import com.agriconnect.constant.OrderStatus;
import com.agriconnect.constant.PaymentStatus;
import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.ProductOrderRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductOrderResponse;
import com.agriconnect.dto.response.ProductOrderStatsResponse;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.ProductOrder;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.ProductMapper;
import com.agriconnect.repository.ProductOrderRepository;
import com.agriconnect.repository.ProductRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.NotificationService;
import com.agriconnect.service.ProductOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductOrderServiceImpl implements ProductOrderService {

    private final ProductOrderRepository productOrderRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CurrentUserProvider currentUserProvider;
    private final NotificationService notificationService;

    @Override
    public ProductOrderResponse placeOrder(ProductOrderRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireAnyRole(currentUser, RoleName.BUYER, RoleName.FARMER, RoleName.EQUIPMENT_OWNER, RoleName.WORKER, RoleName.ADMIN);

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("product.not.found", request.productId()));

        if (product.getApprovalStatus() != ProductStatus.APPROVED || !Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("product.not.available");
        }
        if (product.getFarmer().getId().equals(currentUser.getId())) {
            throw new BadRequestException("product.own.order");
        }
        if (request.quantity().compareTo(product.getQuantityAvailable()) > 0) {
            throw new BadRequestException("product.quantity.exceeds", product.getQuantityAvailable());
        }

        BigDecimal totalAmount = request.quantity().multiply(product.getPricePerUnit());

        ProductOrder order = new ProductOrder();
        order.setBuyer(currentUser);
        order.setProduct(product);
        order.setQuantity(request.quantity());
        order.setPricePerUnitAtOrder(product.getPricePerUnit());
        order.setTotalAmount(totalAmount);
        order.setDeliveryAddress(request.deliveryAddress().trim());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setPaymentProofUrl(clean(request.paymentProofUrl()));
        order.setNotes(clean(request.notes()));

        // Decrement available quantity
        product.setQuantityAvailable(product.getQuantityAvailable().subtract(request.quantity()));
        productRepository.save(product);

        ProductOrder saved = productOrderRepository.save(order);

        notificationService.createSystemNotification(
                product.getFarmer(),
                "New product order received",
                currentUser.getFullName() + " ordered " + request.quantity() + " " + product.getUnit() + " of " + product.getName(),
                NotificationType.PRODUCT_ORDER_PLACED,
                "ProductOrder",
                saved.getId().toString()
        );
        return productMapper.toOrderResponse(saved);
    }

    @Override
    public ProductOrderResponse updateStatus(Long orderId, OrderStatus status, String notes) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProductOrder order = productOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("order.not.found", orderId));

        boolean isAdmin = currentUserProvider.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarmer = order.getProduct().getFarmer().getId().equals(currentUser.getId());
        boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());

        // Validate permission
        if (!isAdmin && !isFarmer && !(isBuyer && status == OrderStatus.CANCELLED)) {
            throw new UnauthorizedException("order.not.authorized");
        }

        // Validate status transitions
        validateStatusTransition(order.getStatus(), status, isBuyer, isAdmin || isFarmer);

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        if (notes != null && !notes.isBlank()) {
            order.setNotes(notes);
        }

        // Restore stock when order is cancelled or rejected
        if (status == OrderStatus.CANCELLED || status == OrderStatus.REJECTED) {
            Product product = order.getProduct();
            product.setQuantityAvailable(product.getQuantityAvailable().add(order.getQuantity()));
            productRepository.save(product);
        }

        ProductOrder saved = productOrderRepository.save(order);

        // Notify the other party
        User notifyUser = isFarmer || isAdmin ? order.getBuyer() : order.getProduct().getFarmer();
        notificationService.createSystemNotification(
                notifyUser,
                "Product order " + status.name().toLowerCase(),
                order.getProduct().getName() + " order status changed to " + status.name(),
                NotificationType.PRODUCT_ORDER_STATUS_CHANGED,
                "ProductOrder",
                saved.getId().toString()
        );
        return productMapper.toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductOrderResponse> listMyOrders(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(productOrderRepository.findByBuyer(currentUser, pageable).map(productMapper::toOrderResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductOrderResponse> listIncomingOrders(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireAnyRole(currentUser, RoleName.FARMER, RoleName.ADMIN);
        return PageResponse.from(productOrderRepository.findByProduct_Farmer(currentUser, pageable).map(productMapper::toOrderResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOrderResponse getById(Long orderId) {
        User currentUser = currentUserProvider.getCurrentUser();
        ProductOrder order = productOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("order.not.found", orderId));

        boolean isAdmin = currentUserProvider.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarmer = order.getProduct().getFarmer().getId().equals(currentUser.getId());
        boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());

        if (!isAdmin && !isFarmer && !isBuyer) {
            throw new UnauthorizedException("order.not.authorized.view");
        }
        return productMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(OrderStatus status) {
        return productOrderRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countAllOrders() {
        return productOrderRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal sumTotalPaidAmount() {
        return productOrderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.PAID);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOrderStatsResponse getMyOrderStats() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<OrderStatus> excludeStatuses = List.of(OrderStatus.CANCELLED, OrderStatus.REJECTED);
        long totalOrders = productOrderRepository.countByBuyerAndStatusNotIn(currentUser, excludeStatuses);
        BigDecimal totalSpent = productOrderRepository.sumTotalAmountByBuyerAndStatusNotIn(currentUser, excludeStatuses);
        return new ProductOrderStatsResponse(totalOrders, totalSpent);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next, boolean isBuyer, boolean isFarmerOrAdmin) {
        if (current == OrderStatus.DELIVERED || current == OrderStatus.CANCELLED || current == OrderStatus.REJECTED) {
            throw new BadRequestException("order.cannot.change.terminal", current.name().toLowerCase());
        }

        if (isBuyer) {
            if (current != OrderStatus.PENDING || next != OrderStatus.CANCELLED) {
                throw new BadRequestException("order.buyer.cancel.only");
            }
            return;
        }

        // Farmer/Admin transitions
        switch (current) {
            case PENDING:
                if (next != OrderStatus.CONFIRMED && next != OrderStatus.REJECTED && next != OrderStatus.CANCELLED) {
                    throw new BadRequestException("order.transition.confirm.reject");
                }
                break;
            case CONFIRMED:
                if (next != OrderStatus.PACKED && next != OrderStatus.CANCELLED) {
                    throw new BadRequestException("order.transition.packed");
                }
                break;
            case PACKED:
                if (next != OrderStatus.DISPATCHED) {
                    throw new BadRequestException("order.transition.dispatched");
                }
                break;
            case DISPATCHED:
                if (next != OrderStatus.OUT_FOR_DELIVERY) {
                    throw new BadRequestException("order.transition.out.for.delivery");
                }
                break;
            case OUT_FOR_DELIVERY:
                if (next != OrderStatus.DELIVERED) {
                    throw new BadRequestException("order.transition.delivered");
                }
                break;
            default:
                throw new BadRequestException("order.transition.invalid");
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
