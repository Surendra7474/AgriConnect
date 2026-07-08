package com.agriconnect.service.impl;

import com.agriconnect.constant.OrderStatus;
import com.agriconnect.constant.PaymentStatus;
import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.ProductOrderRequest;
import com.agriconnect.dto.response.ProductOrderResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.ProductOrder;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.ProductMapper;
import com.agriconnect.repository.ProductOrderRepository;
import com.agriconnect.repository.ProductRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductOrderServiceImplTest {

    @Mock
    private ProductOrderRepository productOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private NotificationService notificationService;

    private ProductOrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        orderService = new ProductOrderServiceImpl(
                productOrderRepository,
                productRepository,
                productMapper,
                currentUserProvider,
                notificationService
        );
    }

    // --- placeOrder tests ---

    @Test
    void placeOrderShouldRejectOverQuantity() {
        User buyer = buyer(1L);
        User farmer = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        product.setQuantityAvailable(BigDecimal.valueOf(5));
        ProductOrderRequest request = new ProductOrderRequest(
                1L, BigDecimal.valueOf(10), "Address 1", null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(buyer);
        when(currentUserProvider.hasRole(buyer, RoleName.BUYER)).thenReturn(true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.placeOrder(request));

        assertEquals("product.quantity.exceeds", ex.getMessageKey());
    }

    @Test
    void placeOrderShouldRejectSelfPurchase() {
        User farmer = farmer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductOrderRequest request = new ProductOrderRequest(
                1L, BigDecimal.valueOf(2), "Address 1", null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(currentUserProvider.hasRole(farmer, RoleName.BUYER)).thenReturn(true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.placeOrder(request));

        assertEquals("product.own.order", ex.getMessageKey());
    }

    @Test
    void placeOrderShouldDecrementQuantity() {
        User buyer = buyer(1L);
        User farmer = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        product.setQuantityAvailable(BigDecimal.valueOf(100));
        ProductOrderRequest request = new ProductOrderRequest(
                1L, BigDecimal.valueOf(3), "Address 1", null
        );
        ProductOrder savedOrder = order(product, buyer, OrderStatus.PENDING, BigDecimal.valueOf(3));

        when(currentUserProvider.getCurrentUser()).thenReturn(buyer);
        when(currentUserProvider.hasRole(buyer, RoleName.BUYER)).thenReturn(true);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productOrderRepository.save(any(ProductOrder.class))).thenReturn(savedOrder);
        when(productMapper.toOrderResponse(savedOrder)).thenReturn(orderResponse(1L, "Tomatoes", "PENDING"));

        ProductOrderResponse response = orderService.placeOrder(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(97), product.getQuantityAvailable());
    }

    @Test
    void placeOrderShouldThrowWhenProductNotFound() {
        User buyer = buyer(1L);
        ProductOrderRequest request = new ProductOrderRequest(
                999L, BigDecimal.ONE, "Addr", null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(buyer);
        when(currentUserProvider.hasRole(buyer, RoleName.BUYER)).thenReturn(true);
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.placeOrder(request));

        assertEquals("product.not.found", ex.getMessageKey());
    }

    // --- updateStatus tests ---

    @Test
    void updateStatusShouldRestoreQuantityOnCancel() {
        User buyer = buyer(1L);
        User farmer = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        product.setQuantityAvailable(BigDecimal.valueOf(50));
        ProductOrder order = order(product, buyer, OrderStatus.PENDING, BigDecimal.valueOf(5));

        when(currentUserProvider.getCurrentUser()).thenReturn(buyer);
        when(currentUserProvider.hasRole(buyer, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productOrderRepository.save(any(ProductOrder.class))).thenReturn(order);
        when(productMapper.toOrderResponse(order)).thenReturn(
                orderResponse(1L, "Tomatoes", "CANCELLED"));

        ProductOrderResponse response = orderService.updateStatus(1L, OrderStatus.CANCELLED, null);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(55), product.getQuantityAvailable());
    }

    @Test
    void updateStatusShouldRestoreQuantityOnReject() {
        User farmer = farmer(2L);
        User buyer = buyer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        product.setQuantityAvailable(BigDecimal.valueOf(50));
        ProductOrder order = order(product, buyer, OrderStatus.PENDING, BigDecimal.valueOf(3));

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(currentUserProvider.hasRole(farmer, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productOrderRepository.save(any(ProductOrder.class))).thenReturn(order);
        when(productMapper.toOrderResponse(order)).thenReturn(
                orderResponse(1L, "Tomatoes", "REJECTED"));

        ProductOrderResponse response = orderService.updateStatus(1L, OrderStatus.REJECTED, null);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(53), product.getQuantityAvailable());
    }

    @Test
    void updateStatusShouldNotRestoreQuantityOnDelivered() {
        User farmer = farmer(2L);
        User buyer = buyer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        product.setQuantityAvailable(BigDecimal.valueOf(50));
        ProductOrder order = order(product, buyer, OrderStatus.OUT_FOR_DELIVERY, BigDecimal.valueOf(3));

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(currentUserProvider.hasRole(farmer, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productOrderRepository.save(any(ProductOrder.class))).thenReturn(order);
        when(productMapper.toOrderResponse(order)).thenReturn(
                orderResponse(1L, "Tomatoes", "DELIVERED"));

        orderService.updateStatus(1L, OrderStatus.DELIVERED, null);

        // Quantity should NOT have changed — delivery doesn't restore stock
        assertEquals(BigDecimal.valueOf(50), product.getQuantityAvailable());
    }

    @Test
    void updateStatusBuyerCanOnlyCancelPending() {
        User buyer = buyer(1L);
        User farmer = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductOrder order = order(product, buyer, OrderStatus.CONFIRMED, BigDecimal.valueOf(2));

        when(currentUserProvider.getCurrentUser()).thenReturn(buyer);
        when(currentUserProvider.hasRole(buyer, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.updateStatus(1L, OrderStatus.CANCELLED, null));

        assertEquals("order.buyer.cancel.only", ex.getMessageKey());
    }

    @Test
    void updateStatusCannotChangeTerminalOrders() {
        User farmer = farmer(2L);
        User buyer = buyer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductOrder order = order(product, buyer, OrderStatus.DELIVERED, BigDecimal.valueOf(2));

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(currentUserProvider.hasRole(farmer, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.updateStatus(1L, OrderStatus.CANCELLED, null));

        assertEquals("order.cannot.change.terminal", ex.getMessageKey());
    }

    @Test
    void updateStatusShouldThrowWhenNotAuthorized() {
        User stranger = buyer(3L);
        User farmer = farmer(2L);
        User buyer = buyer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductOrder order = order(product, buyer, OrderStatus.PENDING, BigDecimal.valueOf(2));

        when(currentUserProvider.getCurrentUser()).thenReturn(stranger);
        when(currentUserProvider.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> orderService.updateStatus(1L, OrderStatus.CANCELLED, null));

        assertEquals("order.not.authorized", ex.getMessageKey());
    }

    @Test
    void updateStatusShouldThrowWhenOrderNotFound() {
        User user = buyer(1L);

        when(productOrderRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.updateStatus(999L, OrderStatus.CANCELLED, null));

        assertEquals("order.not.found", ex.getMessageKey());
    }

    // --- getById tests ---

    @Test
    void getByIdShouldThrowWhenNotAuthorized() {
        User stranger = buyer(3L);
        User farmer = farmer(2L);
        User buyer = buyer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductOrder order = order(product, buyer, OrderStatus.PENDING, BigDecimal.ONE);

        when(currentUserProvider.getCurrentUser()).thenReturn(stranger);
        when(currentUserProvider.hasRole(stranger, RoleName.ADMIN)).thenReturn(false);
        when(productOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> orderService.getById(1L));

        assertEquals("order.not.authorized.view", ex.getMessageKey());
    }

    // --- helpers ---

    private static Role role(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
    }

    private static User buyer(Long id) {
        User user = new User();
        user.setId(id);
        user.setFullName("Buyer " + id);
        user.setEmail("buyer" + id + "@test.com");
        user.setRole(role(RoleName.BUYER));
        user.setActive(Boolean.TRUE);
        return user;
    }

    private static User farmer(Long id) {
        User user = new User();
        user.setId(id);
        user.setFullName("Farmer " + id);
        user.setEmail("farmer" + id + "@test.com");
        user.setRole(role(RoleName.FARMER));
        user.setActive(Boolean.TRUE);
        return user;
    }

    private static Product product(Long id, String name, ProductStatus status, User farmer) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setCategory("Vegetables");
        product.setPricePerUnit(BigDecimal.valueOf(50));
        product.setUnit("kg");
        product.setQuantityAvailable(BigDecimal.valueOf(100));
        product.setHarvestDate(LocalDate.now());
        product.setLocation("Mumbai");
        product.setOrganic(false);
        product.setActive(true);
        product.setApprovalStatus(status);
        product.setFarmer(farmer);
        return product;
    }

    private static ProductOrder order(Product product, User buyer, OrderStatus status, BigDecimal quantity) {
        ProductOrder order = new ProductOrder();
        order.setId(1L);
        order.setProduct(product);
        order.setBuyer(buyer);
        order.setQuantity(quantity);
        order.setPricePerUnitAtOrder(product.getPricePerUnit());
        order.setTotalAmount(quantity.multiply(product.getPricePerUnit()));
        order.setDeliveryAddress("Test Address");
        order.setStatus(status);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        return order;
    }

    private static ProductOrderResponse orderResponse(Long id, String productName, String status) {
        return new ProductOrderResponse(
                id, 1L, productName,
                new UserSummaryResponse(1L, "Buyer", "buyer@test.com", null, "BUYER", true, false, null, "en", Instant.now()),
                new UserSummaryResponse(2L, "Farmer", "farmer@test.com", null, "FARMER", true, false, null, "en", Instant.now()),
                BigDecimal.ONE, BigDecimal.valueOf(50), BigDecimal.valueOf(50),
                "Addr", status, "UNPAID", null, Instant.now(), Instant.now()
        );
    }
}
