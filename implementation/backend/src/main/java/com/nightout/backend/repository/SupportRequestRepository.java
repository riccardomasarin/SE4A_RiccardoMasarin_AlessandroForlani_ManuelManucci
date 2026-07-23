package com.nightout.backend.repository;

import com.nightout.backend.entity.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRequestRepository
        extends JpaRepository<SupportRequest, Long> {
}