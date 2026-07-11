package com.agriconnect.mapper;

import com.agriconnect.dto.response.ProductOrderResponse;
import com.agriconnect.dto.response.ProductResponse;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.ProductImage;
import com.agriconnect.entity.ProductOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final UserMapper userMapper;

    public ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getImages() == null
                ? List.of()
                : product.getImages().stream()
                        .map(ProductImage::getImageUrl)
                        .toList();

        String farmerPhone = product.getFarmer() != null ? product.getFarmer().getPhone() : null;

        return new ProductResponse(
                product.getId(),
                userMapper.toSummary(product.getFarmer()),
                product.getName(),
                product.getCategory(),
                product.getDescription(),
                product.getPricePerUnit(),
                product.getUnit(),
                product.getQuantityAvailable(),
                product.getHarvestDate(),
                product.getLocation(),
                product.getOrganic(),
                product.getActive(),
                product.getApprovalStatus().name(),
                product.getAverageRating(),
                imageUrls,
                farmerPhone,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public ProductOrderResponse toOrderResponse(ProductOrder order) {
        Product product = order.getProduct();
        return new ProductOrderResponse(
                order.getId(),
                product.getId(),
                product.getName(),
                userMapper.toSummary(order.getBuyer()),
                userMapper.toSummary(product.getFarmer()),
                order.getQuantity(),
                order.getPricePerUnitAtOrder(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                order.getNotes(),
                order.getCancellationReason(),
                order.getPaymentProofUrl(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
