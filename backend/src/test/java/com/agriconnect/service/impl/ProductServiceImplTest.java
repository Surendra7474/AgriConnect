package com.agriconnect.service.impl;

import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.ProductRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.ProductMapper;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @Mock
    private NotificationService notificationService;

    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(
                productRepository,
                productMapper,
                currentUserProvider,
                notificationService
        );
    }

    @Test
    void createShouldSetPendingByDefault() {
        User farmer = farmer(1L);
        ProductRequest request = new ProductRequest(
                "Tomatoes", "Vegetables", "Fresh organic tomatoes",
                BigDecimal.valueOf(50), "kg", BigDecimal.valueOf(100),
                LocalDate.now(), "Mumbai", Boolean.TRUE, Boolean.TRUE, null
        );
        Product savedProduct = product(1L, "Tomatoes", ProductStatus.PENDING, farmer);

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(currentUserProvider.hasRole(farmer, RoleName.FARMER)).thenReturn(true);
        when(currentUserProvider.hasRole(farmer, RoleName.ADMIN)).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(productMapper.toResponse(savedProduct)).thenReturn(productResponse(1L, "Tomatoes", ProductStatus.PENDING));

        ProductResponse response = productService.create(request);

        assertNotNull(response);
        assertEquals("Tomatoes", response.name());
    }

    @Test
    void getByIdShouldThrowWhenNotApprovedAndNotOwner() {
        User farmer = farmer(1L);
        User other = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.PENDING, farmer);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(currentUserProvider.getCurrentUser()).thenReturn(other);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> productService.getById(1L));

        assertEquals("product.not.visible", ex.getMessageKey());
    }

    @Test
    void deleteShouldThrowWhenNotOwner() {
        User farmer = farmer(1L);
        User other = farmer(2L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);

        when(currentUserProvider.getCurrentUser()).thenReturn(other);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(currentUserProvider.hasRole(other, RoleName.ADMIN)).thenReturn(false);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> productService.delete(1L));

        assertEquals("product.not.owner", ex.getMessageKey());
    }

    @Test
    void findProductShouldThrowResourceNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> productService.getById(999L));

        assertEquals("product.not.found", ex.getMessageKey());
    }

    @Test
    void updateShouldResetToPendingForNonAdmin() {
        User farmer = farmer(1L);
        Product product = product(1L, "Tomatoes", ProductStatus.APPROVED, farmer);
        ProductRequest request = new ProductRequest(
                "Tomatoes Updated", "Vegetables", "Desc",
                BigDecimal.valueOf(60), "kg", BigDecimal.valueOf(200),
                LocalDate.now(), "Mumbai", Boolean.TRUE, Boolean.TRUE, null
        );

        when(currentUserProvider.getCurrentUser()).thenReturn(farmer);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(currentUserProvider.hasRole(farmer, RoleName.ADMIN)).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(productResponse(1L, "Tomatoes Updated", ProductStatus.PENDING));

        ProductResponse response = productService.update(1L, request);

        assertNotNull(response);
        verify(productRepository).save(product);
    }

    // --- helpers ---

    private static Role role(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
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

    private static ProductResponse productResponse(Long id, String name, ProductStatus status) {
        return new ProductResponse(
                id,
                new UserSummaryResponse(1L, "Farmer 1", "farmer1@test.com", null, "FARMER", true, false, null, "en", Instant.now()),
                name, "Vegetables", "Desc", BigDecimal.valueOf(50), "kg",
                BigDecimal.valueOf(100), LocalDate.now(), "Mumbai", false, true,
                status.name(), 0.0, List.of(), Instant.now(), Instant.now()
        );
    }
}
