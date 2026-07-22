package com.nightout.backend.repository;

import com.nightout.backend.entity.PregameRoom;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PregameRoomRepository extends JpaRepository<PregameRoom, Long> {
    List<PregameRoom> findByEventId(Long eventId);

    List<PregameRoom> findByHostId(Long hostId);
}
