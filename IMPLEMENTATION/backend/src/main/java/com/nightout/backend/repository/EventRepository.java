package com.nightout.backend.repository;

import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.MusicGenre;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByVenueCityIgnoreCase(String city);

    List<Event> findByVenueAreaIgnoreCase(String area);

    List<Event> findByMusicGenre(MusicGenre musicGenre);

    List<Event> findByVenueId(Long venueId);

    List<Event> findByCreatedById(Long managerId);
}
