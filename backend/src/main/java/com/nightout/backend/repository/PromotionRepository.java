package com.nightout.backend.repository;

import com.nightout.backend.entity.Promotion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByEventId(Long eventId);

    List<Promotion> findByVenueId(Long venueId);
}
