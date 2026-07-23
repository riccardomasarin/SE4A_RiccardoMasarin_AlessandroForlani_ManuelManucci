package com.nightout.backend.repository;

import com.nightout.backend.entity.SalesChannel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesChannelRepository extends JpaRepository<SalesChannel, Long> {
    List<SalesChannel> findByEventId(Long eventId);
}
