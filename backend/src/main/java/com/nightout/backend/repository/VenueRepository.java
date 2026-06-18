package com.nightout.backend.repository;

import com.nightout.backend.entity.Venue;
import com.nightout.backend.entity.VenueCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByCategory(VenueCategory category);

    List<Venue> findByPartnerBarTrue();

    List<Venue> findByManagerId(Long managerId);
}
