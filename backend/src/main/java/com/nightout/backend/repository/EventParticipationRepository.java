package com.nightout.backend.repository;

import com.nightout.backend.entity.EventParticipation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {
    List<EventParticipation> findByUserId(Long userId);

    List<EventParticipation> findByEventId(Long eventId);

    Optional<EventParticipation> findByUserIdAndEventId(Long userId, Long eventId);
}
