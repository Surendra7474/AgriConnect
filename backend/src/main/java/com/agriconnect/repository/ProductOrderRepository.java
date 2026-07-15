package com.agriconnect.repository;

import com.agriconnect.constant.OrderStatus;
import com.agriconnect.constant.PaymentStatus;
import com.agriconnect.entity.ProductOrder;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface ProductOrderRepository extends JpaRepository<ProductOrder, Long> {

    Page<ProductOrder> findByBuyer(User buyer, Pageable pageable);

    Page<ProductOrder> findByProduct_Farmer(User farmer, Pageable pageable);

    long countByStatus(OrderStatus status);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("""
            select coalesce(sum(po.totalAmount), 0)
            from ProductOrder po
            where po.paymentStatus = :paymentStatus
            """)
    BigDecimal sumTotalAmountByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);

    long countByBuyerAndStatusNotIn(User buyer, java.util.List<OrderStatus> statuses);

    @Query("""
            select coalesce(sum(po.totalAmount), 0)
            from ProductOrder po
            where po.buyer = :buyer
              and po.status not in :excludeStatuses
            """)
    BigDecimal sumTotalAmountByBuyerAndStatusNotIn(@Param("buyer") User buyer, @Param("excludeStatuses") java.util.List<OrderStatus> excludeStatuses);
}
