package com.agriconnect.config;

import com.agriconnect.constant.RoleName;
import com.agriconnect.constant.WorkerApprovalStatus;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.entity.WorkerProfile;
import com.agriconnect.repository.RoleRepository;
import com.agriconnect.repository.UserRepository;
import com.agriconnect.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            });
        }
        createDefaultAdmin();
        migrateWorkerProfiles();
    }

    /**
     * Migrate existing PENDING worker profiles to APPROVED.
     * This handles legacy profiles created before auto-approve was enabled in
     * upsertMyProfile(). Without this, those profiles remain invisible to farmers.
     */
    private void migrateWorkerProfiles() {
        java.util.List<WorkerProfile> pendingProfiles =
                workerProfileRepository.findByApprovalStatus(WorkerApprovalStatus.PENDING, org.springframework.data.domain.Pageable.unpaged()).getContent();
        if (!pendingProfiles.isEmpty()) {
            for (WorkerProfile profile : pendingProfiles) {
                profile.setApprovalStatus(WorkerApprovalStatus.APPROVED);
            }
            workerProfileRepository.saveAll(pendingProfiles);
            log.info("Migrated {} PENDING worker profiles to APPROVED", pendingProfiles.size());
        }
    }

    private void createDefaultAdmin() {
        AppProperties.Admin adminProperties = appProperties.admin();
        if (adminProperties == null) {
            return;
        }

        String adminEmail = adminProperties.defaultEmail();
        if (adminEmail == null || adminEmail.isBlank() || userRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }
        String adminPassword = adminProperties.defaultPassword();
        if (adminPassword == null || adminPassword.isBlank()) {
            throw new IllegalStateException("Default admin password must be configured");
        }

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new IllegalStateException("ADMIN role was not initialized"));
        User admin = new User();
        admin.setFullName("AgriConnect Administrator");
        admin.setEmail(adminEmail.trim().toLowerCase());
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setPhone("+10000000000");
        admin.setRole(adminRole);
        admin.setActive(Boolean.TRUE);
        admin.setVerified(Boolean.TRUE);
        userRepository.save(admin);
    }
}
