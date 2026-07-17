package com.nightout.backend.repository;

import com.nightout.backend.entity.PrEventAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrEventAssignmentRepository
        extends JpaRepository<PrEventAssignment, Long> {

    Optional<PrEventAssignment>
            findByEventIdAndPromoCodeIgnoreCaseAndActiveTrue(
                    Long eventId,
                    String promoCode
            );

    List<PrEventAssignment>
            findByPrIdOrderByCreatedAtDesc(
                    Long prId
            );

    List<PrEventAssignment>
            findByPrIdAndActiveTrueOrderByCreatedAtDesc(
                    Long prId
            );
}