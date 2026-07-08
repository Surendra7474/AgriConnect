package com.agriconnect.service;

import com.agriconnect.constant.RoleName;
import com.agriconnect.dto.response.AdminDashboardResponse;
import com.agriconnect.dto.response.PageResponse;
import com.agriconnect.dto.response.UserSummaryResponse;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    AdminDashboardResponse dashboard();

    PageResponse<UserSummaryResponse> listUsers(Pageable pageable, String search, RoleName role, Boolean active);

    UserSummaryResponse updateUserActiveStatus(Long userId, Boolean active);
}
