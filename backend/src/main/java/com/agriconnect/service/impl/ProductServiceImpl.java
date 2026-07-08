package com.agriconnect.service.impl;

import com.agriconnect.constant.NotificationType;
import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.request.ProductRequest;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.ProductResponse;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.ProductImage;
import com.agriconnect.entity.User;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.exception.UnauthorizedException;
import com.agriconnect.mapper.ProductMapper;
import com.agriconnect.repository.ProductRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.NotificationService;
import com.agriconnect.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CurrentUserProvider currentUserProvider;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listApproved(String search, String category, String location, Boolean available, Boolean organic, Pageable pageable) {
        return PageResponse.from(productRepository.searchApproved(
                ProductStatus.APPROVED,
                clean(search),
                clean(category),
                clean(location),
                available,
                organic,
                pageable
        ).map(productMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listMine(Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        return PageResponse.from(productRepository.findByFarmer(currentUser, pageable).map(productMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = findProduct(id);
        User currentUser = currentUserProvider.getCurrentUser();
        if (product.getApprovalStatus() != ProductStatus.APPROVED && !canManageProduct(currentUser, product)) {
            throw new UnauthorizedException("product.not.visible");
        }
        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.FARMER);

        Product product = new Product();
        product.setFarmer(currentUser);
        applyRequest(product, request);
        product.setApprovalStatus(currentUserProvider.hasRole(currentUser, RoleName.ADMIN)
                ? ProductStatus.APPROVED
                : ProductStatus.PENDING);

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Product product = findProduct(id);
        requireProductManager(currentUser, product);

        applyRequest(product, request);
        if (!currentUserProvider.hasRole(currentUser, RoleName.ADMIN)) {
            product.setApprovalStatus(ProductStatus.PENDING);
        }
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        User currentUser = currentUserProvider.getCurrentUser();
        Product product = findProduct(id);
        requireProductManager(currentUser, product);
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listForAdmin(ProductStatus status, String search, Pageable pageable) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        return PageResponse.from(productRepository.searchForAdmin(status, clean(search), pageable).map(productMapper::toResponse));
    }

    @Override
    public ProductResponse updateApprovalStatus(Long productId, ProductStatus status) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        Product product = findProduct(productId);
        product.setApprovalStatus(status);
        Product saved = productRepository.save(product);

        NotificationType notificationType = status == ProductStatus.APPROVED
                ? NotificationType.PRODUCT_APPROVED
                : NotificationType.PRODUCT_REJECTED;
        notificationService.createSystemNotification(
                product.getFarmer(),
                "Product approval updated",
                product.getName() + " is now " + status.name(),
                notificationType,
                "Product",
                saved.getId().toString()
        );
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByApprovalStatus(ProductStatus status) {
        return productRepository.countByApprovalStatus(status);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setDescription(clean(request.description()));
        product.setPricePerUnit(request.pricePerUnit());
        product.setUnit(request.unit().trim());
        product.setQuantityAvailable(request.quantityAvailable());
        product.setHarvestDate(request.harvestDate());
        product.setLocation(request.location().trim());
        product.setOrganic(request.organic() != null && request.organic());
        product.setActive(request.active() == null || request.active());
        replaceImages(product, request.imageUrls());
    }

    private void replaceImages(Product product, List<String> imageUrls) {
        product.getImages().clear();
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        for (int index = 0; index < imageUrls.size(); index++) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(imageUrls.get(index).trim());
            image.setPrimaryImage(index == 0);
            product.getImages().add(image);
        }
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("product.not.found", id));
    }

    private boolean canManageProduct(User user, Product product) {
        return currentUserProvider.hasRole(user, RoleName.ADMIN)
                || product.getFarmer().getId().equals(user.getId());
    }

    private void requireProductManager(User user, Product product) {
        if (!canManageProduct(user, product)) {
            throw new UnauthorizedException("product.not.owner");
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
