package com.agriconnect.repository;

import com.agriconnect.constant.RoleName;
import com.agriconnect.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}
