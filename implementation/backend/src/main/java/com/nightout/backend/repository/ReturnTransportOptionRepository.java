package com.nightout.backend.repository;

import com.nightout.backend.entity.ReturnTransportOption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReturnTransportOptionRepository extends JpaRepository<ReturnTransportOption, Long> {
    List<ReturnTransportOption> findByEventId(Long eventId);
}
