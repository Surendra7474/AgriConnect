package com.agriconnect.service.impl;

import com.agriconnect.constant.BookingStatus;
import com.agriconnect.constant.EquipmentStatus;
import com.agriconnect.constant.FeedbackStatus;
import com.agriconnect.constant.HiringStatus;
import com.agriconnect.constant.OrderStatus;
import com.agriconnect.constant.ProductStatus;
import com.agriconnect.constant.RoleName;
import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.dto.response.AdminDashboardResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import com.agriconnect.entity.User;
import com.agriconnect.exception.BadRequestException;
import com.agriconnect.exception.ResourceNotFoundException;
import com.agriconnect.mapper.UserMapper;
import com.agriconnect.repository.EquipmentBookingRepository;
import com.agriconnect.repository.EquipmentRepository;
import com.agriconnect.repository.FeedbackRepository;
import com.agriconnect.repository.UserRepository;
import com.agriconnect.repository.WorkerHiringRepository;
import com.agriconnect.repository.WorkerProfileRepository;
import com.agriconnect.security.CurrentUserProvider;
import com.agriconnect.service.AdminService;
import com.agriconnect.service.ProductOrderService;
import com.agriconnect.service.ProductService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final FeedbackRepository feedbackRepository;
    private final EquipmentBookingRepository equipmentBookingRepository;
    private final WorkerHiringRepository workerHiringRepository;
    private final ProductService productService;
    private final ProductOrderService productOrderService;
    private final UserMapper userMapper;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByActiveTrue(),
                feedbackRepository.countByStatus(FeedbackStatus.OPEN),
                productOrderService.countByStatus(OrderStatus.PENDING),
                productOrderService.countAllOrders(),
                productOrderService.sumTotalPaidAmount()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserSummaryResponse> listUsers(Pageable pageable, String search, RoleName role, Boolean active) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role").get("name"), role));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return PageResponse.from(userRepository.findAll(spec, pageable).map(userMapper::toSummary));
    }

    @Override
    public UserSummaryResponse updateUserActiveStatus(Long userId, Boolean active) {
        User currentUser = currentUserProvider.getCurrentUser();
        currentUserProvider.requireRole(currentUser, RoleName.ADMIN);
        if (currentUser.getId().equals(userId) && !Boolean.TRUE.equals(active)) {
            throw new BadRequestException("admin.cannot.deactivate.self");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.not.found", userId));
        user.setActive(active);
        return userMapper.toSummary(userRepository.save(user));
    }
}
