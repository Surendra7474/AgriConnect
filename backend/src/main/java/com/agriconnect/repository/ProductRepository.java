package com.agriconnect.repository;

import com.agriconnect.constant.ProductStatus;
import com.agriconnect.entity.Product;
import com.agriconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByApprovalStatus(ProductStatus approvalStatus, Pageable pageable);

    Page<Product> findByFarmer(User farmer, Pageable pageable);

    Page<Product> findByActiveTrueAndApprovalStatus(ProductStatus approvalStatus, Pageable pageable);

    long countByApprovalStatus(ProductStatus approvalStatus);

    @Query("""
            select p from Product p
            where p.approvalStatus = :status
              and (:category is null or lower(p.category) = lower(:category))
              and (:location is null or lower(p.location) like lower(concat('%', :location, '%')))
              and (:available is null or p.active = :available)
              and (:organic is null or p.organic = :organic)
              and (
                    :search is null
                    or lower(p.name) like lower(concat('%', :search, '%'))
                    or lower(coalesce(p.description, '')) like lower(concat('%', :search, '%'))
                    or lower(p.category) like lower(concat('%', :search, '%'))
                    or lower(p.location) like lower(concat('%', :search, '%'))
                  )
            """)
    Page<Product> searchApproved(
            @Param("status") ProductStatus status,
            @Param("search") String search,
            @Param("category") String category,
            @Param("location") String location,
            @Param("available") Boolean available,
            @Param("organic") Boolean organic,
            Pageable pageable
    );

    @Query("""
            select p from Product p
            where (:status is null or p.approvalStatus = :status)
              and (:search is null or lower(p.name) like lower(concat('%', :search, '%')))
            """)
    Page<Product> searchForAdmin(
            @Param("status") ProductStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}