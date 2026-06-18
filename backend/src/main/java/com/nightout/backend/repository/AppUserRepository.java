package com.nightout.backend.repository;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    List<AppUser> findByRole(UserRole role);

    Optional<AppUser> findByEmail(String email);
}
