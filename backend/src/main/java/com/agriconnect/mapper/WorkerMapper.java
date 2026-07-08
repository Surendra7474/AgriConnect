package com.agriconnect.mapper;

import com.agriconnect.dto.response.WorkerHiringResponse;
import com.agriconnect.dto.response.WorkerProfileResponse;
import com.agriconnect.entity.WorkerHiring;
import com.agriconnect.entity.WorkerProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkerMapper {

    private final UserMapper userMapper;

    public WorkerProfileResponse toResponse(WorkerProfile profile) {
        return new WorkerProfileResponse(
                profile.getId(),
                userMapper.toSummary(profile.getUser()),
                profile.getSkills(),
                profile.getLocation(),
                profile.getDailyRate(),
                profile.getBio(),
                profile.getPhoneNumber(),
                profile.getAvailable(),
                profile.getApprovalStatus().name(),
                profile.getAverageRating(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public WorkerHiringResponse toHiringResponse(WorkerHiring hiring) {
        WorkerProfile profile = hiring.getWorkerProfile();
        return new WorkerHiringResponse(
                hiring.getId(),
                profile.getId(),
                userMapper.toSummary(profile.getUser()),
                userMapper.toSummary(hiring.getFarmer()),
                hiring.getStartDate(),
                hiring.getEndDate(),
                hiring.getTotalAmount(),
                hiring.getStatus().name(),
                hiring.getNotes(),
                hiring.getCreatedAt(),
                hiring.getUpdatedAt()
        );
    }
}
